"""Entrenamiento del pronóstico de tratamiento con una cohorte REAL.

Este script NO aprueba modelos. Solo produce, para revisión clínica humana:
  - treatment_predictor.joblib  (paquete compatible con treatment_predictor.py)
  - validation-report.json / validation-report.md
  - SHA256SUMS.txt
  - treatment-manifest.draft.json  (status PENDING_CLINICAL_REVIEW)

El predictor solo carga un ``treatment-manifest.json`` con estado aprobado que
un revisor humano crea y firma fuera de este script. Aquí no existe ninguna
opción para escribir ese estado ni ese archivo.

Columna sesiones_hasta_alta: en filas con abandono=1 es un conteo truncado y se
ignora para el regresor de sesiones (solo se entrena y evalúa con abandono=0);
el clasificador de abandono usa todas las filas.

Uso:
  python ml-service/train_predictive_model.py \
      --train-csv train.csv --validation-csv validation.csv \
      --output-dir ml-artifacts/run-001 --dataset-version cohorte-2026-11 \
      --diagnosis-codebook codebook.json
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import re
import shutil
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np

from treatment_predictor import (
    FEATURE_NAMES,
    MAX_RECOMMENDED_SESSIONS,
    TreatmentPredictionInput,
    TreatmentPredictor,
)

TARGET_SESSIONS = "sesiones_hasta_alta"
TARGET_DROPOUT = "abandono"
EXPECTED_COLUMNS = [*FEATURE_NAMES, TARGET_SESSIONS, TARGET_DROPOUT]

# Estado que este script escribe. El estado aprobado solo lo fija un humano.
DRAFT_STATUS = "PENDING_CLINICAL_REVIEW"
DRAFT_MANIFEST_NAME = "treatment-manifest.draft.json"
MODEL_FILE_NAME = "treatment_predictor.joblib"
REPORT_JSON_NAME = "validation-report.json"
REPORT_MD_NAME = "validation-report.md"
CHECKSUMS_NAME = "SHA256SUMS.txt"

RANDOM_SEED = 20260101
DEFAULT_MIN_TRAIN = 200
DEFAULT_MIN_VALIDATION = 100
DEFAULT_MIN_PER_CLASS = 20
DEFAULT_MIN_COMPLETED = 50
DEFAULT_MAX_SHARED_FRACTION = 0.5

# Fragmentos de nombres de columna que delatan identificación directa.
IDENTIFIER_FRAGMENTS = (
    "nombre", "apellido", "name", "dni", "documento", "correo", "email", "mail",
    "telefono", "celular", "phone", "whatsapp", "direccion", "address",
    "id_paciente", "paciente", "id_usuario", "usuario", "id_expediente",
    "expediente", "id_tratamiento", "id_reserva", "id_sesion", "fecha_nacimiento",
    "nacimiento", "tutor", "padre", "madre", "curp", "ssn", "passport", "pasaporte",
)
DIAGNOSIS_CODES = [str(code) for code in range(0, 4)]


class TrainingError(Exception):
    """Error de validación o entrenamiento; no se genera ningún artefacto."""


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _normalize(name: str) -> str:
    return re.sub(r"[^a-z0-9_]", "", name.strip().lower().replace(" ", "_"))


def _parse_int(value: str, column: str, row_number: int, source: str) -> int:
    text = (value or "").strip()
    if not re.fullmatch(r"[+-]?\d+", text):
        raise TrainingError(
            f"{source}: fila {row_number}, columna '{column}' debe ser un entero sin vacíos (valor: {value!r})."
        )
    return int(text)


def load_cohort(path: Path, source: str) -> np.ndarray:
    """Lee y valida un CSV; devuelve matriz entera con EXPECTED_COLUMNS."""
    if not path.is_file():
        raise TrainingError(f"{source}: no existe el archivo {path}.")
    try:
        handle = path.open("r", encoding="utf-8-sig", newline="")
    except OSError as exc:
        raise TrainingError(f"{source}: no se puede leer {path}: {exc}.") from exc
    with handle:
        reader = csv.reader(handle)
        try:
            header = next(reader)
        except StopIteration as exc:
            raise TrainingError(f"{source}: el archivo está vacío.") from exc
        columns = [_normalize(name) for name in header]

        identifiers = [
            raw for raw, norm in zip(header, columns)
            if any(fragment in norm for fragment in IDENTIFIER_FRAGMENTS)
        ]
        if identifiers:
            raise TrainingError(
                f"{source}: columnas de identificación directa no permitidas: {', '.join(identifiers)}. "
                "Exporta la cohorte anonimizada."
            )
        if len(set(columns)) != len(columns):
            raise TrainingError(f"{source}: hay columnas duplicadas.")
        missing = [name for name in EXPECTED_COLUMNS if name not in columns]
        extra = [name for name in columns if name not in EXPECTED_COLUMNS]
        if missing or extra:
            raise TrainingError(
                f"{source}: columnas inválidas. Faltan: {missing or 'ninguna'}; sobran: {extra or 'ninguna'}. "
                f"Se esperan exactamente: {', '.join(EXPECTED_COLUMNS)}."
            )
        index = {name: columns.index(name) for name in EXPECTED_COLUMNS}

        rows: list[list[int]] = []
        for row_number, record in enumerate(reader, start=2):
            if not any(cell.strip() for cell in record):
                continue
            if len(record) != len(columns):
                raise TrainingError(f"{source}: fila {row_number} tiene {len(record)} columnas, se esperaban {len(columns)}.")
            values = {name: _parse_int(record[idx], name, row_number, source) for name, idx in index.items()}
            try:
                TreatmentPredictionInput(**{name: values[name] for name in FEATURE_NAMES})
            except ValueError as exc:
                raise TrainingError(f"{source}: fila {row_number} fuera de rango de variables: {exc}") from exc
            if not 1 <= values[TARGET_SESSIONS] <= MAX_RECOMMENDED_SESSIONS:
                raise TrainingError(
                    f"{source}: fila {row_number}, {TARGET_SESSIONS} debe estar entre 1 y {MAX_RECOMMENDED_SESSIONS}."
                )
            if values[TARGET_DROPOUT] not in (0, 1):
                raise TrainingError(f"{source}: fila {row_number}, {TARGET_DROPOUT} debe ser 0 o 1.")
            rows.append([values[name] for name in EXPECTED_COLUMNS])
    if not rows:
        raise TrainingError(f"{source}: no contiene filas de datos.")
    return np.asarray(rows, dtype=np.int64)


def validate_cohorts(
    train: np.ndarray,
    validation: np.ndarray,
    min_train: int,
    min_validation: int,
    min_per_class: int,
    min_completed: int = DEFAULT_MIN_COMPLETED,
    max_shared_fraction: float = DEFAULT_MAX_SHARED_FRACTION,
) -> dict[str, Any]:
    """Valida cohortes. Devuelve estadísticas de coincidencia para el informe."""
    for label, data, minimum in (("entrenamiento", train, min_train), ("validación", validation, min_validation)):
        if len(data) < minimum:
            raise TrainingError(
                f"La cohorte de {label} tiene {len(data)} filas; el mínimo configurado es {minimum}."
            )
        positives = int(data[:, -1].sum())
        negatives = len(data) - positives
        if positives == 0 or negatives == 0:
            raise TrainingError(f"La cohorte de {label} debe contener ambas clases de abandono (0 y 1).")
        if min(positives, negatives) < min_per_class:
            raise TrainingError(
                f"La cohorte de {label} tiene solo {min(positives, negatives)} casos en la clase minoritaria; "
                f"el mínimo configurado es {min_per_class}."
            )
        completed = len(data) - positives
        if completed < min_completed:
            raise TrainingError(
                f"La cohorte de {label} tiene {completed} filas de alta (abandono=0); el mínimo para el regresor "
                f"de sesiones es {min_completed}."
            )
    train_rows = {tuple(int(v) for v in row) for row in train}
    shared = sum(1 for row in validation if tuple(int(v) for v in row) in train_rows)
    fraction = shared / len(validation)
    if fraction > max_shared_fraction:
        raise TrainingError(
            f"{shared} de {len(validation)} filas de validación ({fraction:.2f}) coinciden con entrenamiento; "
            f"supera el umbral {max_shared_fraction}. Parece la misma cohorte."
        )
    return {"validation_rows_identical_to_train": int(shared), "validation_identical_fraction": round(fraction, 4)}


def load_codebook(path: Path) -> dict[str, str]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise TrainingError(f"Catálogo diagnóstico ilegible: {exc}") from exc
    if (
        not isinstance(data, dict)
        or set(data) != set(DIAGNOSIS_CODES)
        or any(not isinstance(label, str) or not label.strip() for label in data.values())
    ):
        raise TrainingError("El catálogo diagnóstico debe ser un JSON con exactamente los códigos 0 a 3 y etiquetas no vacías.")
    return {code: data[code].strip() for code in DIAGNOSIS_CODES}


def train_models(train: np.ndarray) -> dict[str, Any]:
    from sklearn.calibration import CalibratedClassifierCV
    from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor

    x = train[:, : len(FEATURE_NAMES)]
    sessions = train[:, len(FEATURE_NAMES)].astype(float)
    dropout = train[:, len(FEATURE_NAMES) + 1]
    # En abandono, sesiones_hasta_alta es un conteo truncado: el regresor usa solo altas.
    done = dropout == 0

    sessions_model = RandomForestRegressor(
        n_estimators=300, min_samples_leaf=3, random_state=RANDOM_SEED, n_jobs=1
    )
    sessions_model.fit(x[done], sessions[done])

    minority = int(min(dropout.sum(), len(dropout) - dropout.sum()))
    folds = max(2, min(5, minority))
    dropout_model = CalibratedClassifierCV(
        estimator=RandomForestClassifier(
            n_estimators=300, min_samples_leaf=3, random_state=RANDOM_SEED, n_jobs=1
        ),
        method="sigmoid",
        cv=folds,
    )
    dropout_model.fit(x, dropout)
    return {
        "feature_names": list(FEATURE_NAMES),
        "sessions_model": sessions_model,
        "dropout_model": dropout_model,
    }


def evaluate(bundle: dict[str, Any], validation: np.ndarray) -> dict[str, Any]:
    from sklearn.metrics import brier_score_loss, roc_auc_score

    x = validation[:, : len(FEATURE_NAMES)]
    sessions = validation[:, len(FEATURE_NAMES)].astype(float)
    dropout = validation[:, len(FEATURE_NAMES) + 1]

    done = dropout == 0
    predicted_sessions = bundle["sessions_model"].predict(x[done])
    sessions = sessions[done]
    abs_error = np.abs(predicted_sessions - sessions)
    mae = float(abs_error.mean())
    rmse = float(math.sqrt(float(((predicted_sessions - sessions) ** 2).mean())))
    interval = int(math.ceil(float(np.quantile(abs_error, 0.9))))

    classes = list(bundle["dropout_model"].classes_)
    probabilities = bundle["dropout_model"].predict_proba(x)[:, classes.index(1)]
    auc = float(roc_auc_score(dropout, probabilities))
    brier = float(brier_score_loss(dropout, probabilities))

    edges = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0]
    calibration = []
    for low, high in zip(edges[:-1], edges[1:]):
        mask = (probabilities >= low) & ((probabilities < high) if high < 1.0 else (probabilities <= high))
        count = int(mask.sum())
        calibration.append({
            "bin": f"[{low:.1f}, {high:.1f}{']' if high >= 1.0 else ')'}",
            "n": count,
            "mean_predicted": round(float(probabilities[mask].mean()), 4) if count else None,
            "observed_rate": round(float(dropout[mask].mean()), 4) if count else None,
        })

    medium = round(float(np.quantile(probabilities, 0.5)), 2)
    high_t = round(float(np.quantile(probabilities, 0.8)), 2)
    if not 0 <= medium < high_t <= 1:
        medium, high_t = 0.3, 0.6
    bands = {}
    for name, mask in (
        ("BAJO", probabilities < medium),
        ("MEDIO", (probabilities >= medium) & (probabilities < high_t)),
        ("ALTO", probabilities >= high_t),
    ):
        count = int(mask.sum())
        bands[name] = {"n": count, "observed_rate": round(float(dropout[mask].mean()), 4) if count else None}

    return {
        "sample_count": int(len(validation)),
        "completed_rows_used_for_sessions": int(done.sum()),
        "sessions": {
            "mae": round(mae, 4),
            "rmse": round(rmse, 4),
            "abs_error_p90_ceil": interval,
        },
        "dropout": {
            "prevalence": round(float(dropout.mean()), 4),
            "auc": round(auc, 4),
            "brier": round(brier, 4),
            "calibration_table": calibration,
        },
        "suggested_risk_thresholds": {
            "medium": medium,
            "high": high_t,
            "method": "percentiles 50 y 80 de la probabilidad predicha en la cohorte independiente; solo sugerencia heurística para revisión clínica",
            "observed_rate_by_band": bands,
        },
    }


def _render_markdown(report: dict[str, Any]) -> str:
    m = report["metrics"]
    lines = [
        "# Informe de validación del pronóstico de tratamiento (BORRADOR)",
        "",
        f"- Versión de cohorte: {report['dataset_version']}",
        f"- Generado: {report['generated_at']}",
        f"- Estado: {DRAFT_STATUS}. Este informe no aprueba el modelo.",
        f"- Filas de entrenamiento: {report['train_rows']}; validación independiente: {report['validation_rows']}",
        f"- Filas de alta usadas para el regresor de sesiones: entrenamiento {report['train_completed_rows_used_for_sessions']}, "
        f"validación {m['completed_rows_used_for_sessions']} (las de abandono se ignoran para sesiones)",
        f"- Filas de validación idénticas a entrenamiento: {report['validation_rows_identical_to_train']} "
        f"(fracción {report['validation_identical_fraction']}); coincidencias parciales son posibles con variables discretas, revisar",
        f"- SHA-256 CSV entrenamiento: {report['train_csv_sha256']}",
        f"- SHA-256 CSV validación: {report['validation_csv_sha256']}",
        "",
        "## Sesiones hasta el alta (cohorte independiente)",
        f"- MAE: {m['sessions']['mae']}",
        f"- RMSE: {m['sessions']['rmse']}",
        f"- Cuantil 90 del error absoluto (redondeado hacia arriba): {m['sessions']['abs_error_p90_ceil']} sesiones",
        "",
        "## Abandono (cohorte independiente)",
        f"- Prevalencia: {m['dropout']['prevalence']}",
        f"- AUC: {m['dropout']['auc']}",
        f"- Brier: {m['dropout']['brier']}",
        "",
        "| Intervalo | n | Probabilidad media | Tasa observada |",
        "|---|---|---|---|",
    ]
    for row in m["dropout"]["calibration_table"]:
        lines.append(f"| {row['bin']} | {row['n']} | {row['mean_predicted']} | {row['observed_rate']} |")
    t = m["suggested_risk_thresholds"]
    lines += [
        "",
        "## Umbrales de riesgo sugeridos (requieren revisión clínica)",
        f"- Medio: {t['medium']}; Alto: {t['high']}",
        f"- Método: {t['method']}",
    ]
    for name, band in t["observed_rate_by_band"].items():
        lines.append(f"- {name}: n={band['n']}, tasa observada={band['observed_rate']}")
    lines += [
        "",
        "## Pendiente de revisión humana",
        "Un revisor clínico debe validar cohorte, calibración, catálogo diagnóstico y umbrales, y crear y firmar "
        "`treatment-manifest.json` fuera de este script.",
        "",
    ]
    return "\n".join(lines)


def run(args: argparse.Namespace) -> dict[str, Any]:
    train_csv = Path(args.train_csv)
    validation_csv = Path(args.validation_csv)
    output_dir = Path(args.output_dir)
    dataset_version = (args.dataset_version or "").strip()
    if not dataset_version or not re.fullmatch(r"[A-Za-z0-9._-]{1,80}", dataset_version):
        raise TrainingError("--dataset-version es obligatorio y solo admite letras, números, punto, guion y guion bajo.")
    if args.min_train_samples < 1 or args.min_validation_samples < 1 or args.min_per_class < 1:
        raise TrainingError("Los mínimos de muestras deben ser enteros positivos.")
    if train_csv.resolve() == validation_csv.resolve():
        raise TrainingError("La cohorte de validación debe ser un archivo distinto del de entrenamiento.")
    if output_dir.exists() and any(output_dir.iterdir()):
        raise TrainingError(f"{output_dir} ya contiene archivos; usa un directorio de salida nuevo o vacío.")

    codebook = load_codebook(Path(args.diagnosis_codebook))
    train = load_cohort(train_csv, "entrenamiento")
    validation = load_cohort(validation_csv, "validación")
    if sha256_file(train_csv) == sha256_file(validation_csv):
        raise TrainingError("Los CSV de entrenamiento y validación tienen el mismo SHA-256.")
    if not 0 <= args.max_shared_fraction <= 1:
        raise TrainingError("--max-shared-fraction debe estar entre 0 y 1.")
    overlap = validate_cohorts(
        train, validation, args.min_train_samples, args.min_validation_samples, args.min_per_class,
        args.min_completed, args.max_shared_fraction,
    )

    bundle = train_models(train)
    metrics = evaluate(bundle, validation)
    generated_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")

    import joblib

    staging = Path(tempfile.mkdtemp(prefix="treatment-train-"))
    try:
        model_path = staging / MODEL_FILE_NAME
        joblib.dump(bundle, model_path)
        model_hash = sha256_file(model_path)

        report = {
            "status": DRAFT_STATUS,
            "dataset_version": dataset_version,
            "generated_at": generated_at,
            "random_seed": RANDOM_SEED,
            "feature_names": list(FEATURE_NAMES),
            "train_rows": int(len(train)),
            "train_completed_rows_used_for_sessions": int((train[:, -1] == 0).sum()),
            **overlap,
            "validation_rows": int(len(validation)),
            "train_csv_sha256": sha256_file(train_csv),
            "validation_csv_sha256": sha256_file(validation_csv),
            "model_sha256": model_hash,
            "metrics": metrics,
        }
        report_json = staging / REPORT_JSON_NAME
        report_json.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        report_hash = sha256_file(report_json)
        report_md = staging / REPORT_MD_NAME
        report_md.write_text(_render_markdown(report), encoding="utf-8")

        manifest = {
            "status": DRAFT_STATUS,
            "version": f"treatment-rf-{dataset_version}-{model_hash[:8]}",
            "model_path": MODEL_FILE_NAME,
            "model_sha256": model_hash,
            "feature_names": list(FEATURE_NAMES),
            "diagnosis_codebook": codebook,
            "validation": {
                "dataset_version": dataset_version,
                "report_path": REPORT_JSON_NAME,
                "report_sha256": report_hash,
                "reviewed_by": "",
                "reviewed_at": "",
                "independent_cohort": False,
                "calibration_verified": False,
                "diagnosis_codebook_reviewed": False,
                "sample_count": metrics["sample_count"],
                "prediction_interval_90_sessions": metrics["sessions"]["abs_error_p90_ceil"],
                "risk_thresholds": {
                    "medium": metrics["suggested_risk_thresholds"]["medium"],
                    "high": metrics["suggested_risk_thresholds"]["high"],
                },
                "metrics": {
                    "mae": metrics["sessions"]["mae"],
                    "rmse": metrics["sessions"]["rmse"],
                    "auc": metrics["dropout"]["auc"],
                    "brier": metrics["dropout"]["brier"],
                },
            },
        }
        draft_path = staging / DRAFT_MANIFEST_NAME
        draft_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

        # El predictor debe rechazar el borrador (estado pendiente).
        try:
            TreatmentPredictor._validate_manifest(manifest, staging)
        except ValueError:
            pass
        else:
            raise TrainingError("El predictor aceptó el borrador; se aborta sin producir artefactos.")

        checksums = [
            f"{sha256_file(staging / name)}  {name}"
            for name in (MODEL_FILE_NAME, REPORT_JSON_NAME, REPORT_MD_NAME, DRAFT_MANIFEST_NAME)
        ]
        (staging / CHECKSUMS_NAME).write_text("\n".join(checksums) + "\n", encoding="utf-8")

        output_dir.mkdir(parents=True, exist_ok=True)
        for item in staging.iterdir():
            shutil.move(str(item), str(output_dir / item.name))
    finally:
        shutil.rmtree(staging, ignore_errors=True)
    return {"output_dir": str(output_dir), "report": report, "manifest": manifest}


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Entrena el pronóstico de tratamiento y genera un BORRADOR de manifiesto pendiente de revisión clínica."
    )
    parser.add_argument("--train-csv", required=True, help="CSV de entrenamiento anonimizado.")
    parser.add_argument("--validation-csv", required=True, help="CSV de cohorte independiente para validación.")
    parser.add_argument("--output-dir", required=True, help="Directorio nuevo o vacío para los artefactos.")
    parser.add_argument("--dataset-version", required=True, help="Identificador de versión de la cohorte.")
    parser.add_argument("--diagnosis-codebook", required=True, help='JSON {"0": "...", ..., "3": "..."} institucional (debe coincidir con el catálogo del backend).')
    parser.add_argument("--min-train-samples", type=int, default=DEFAULT_MIN_TRAIN)
    parser.add_argument("--min-validation-samples", type=int, default=DEFAULT_MIN_VALIDATION)
    parser.add_argument("--min-completed", type=int, default=DEFAULT_MIN_COMPLETED,
                        help="Mínimo de filas de alta (abandono=0) por cohorte para el regresor de sesiones.")
    parser.add_argument("--max-shared-fraction", type=float, default=DEFAULT_MAX_SHARED_FRACTION,
                        help="Fracción máxima de filas de validación idénticas a entrenamiento.")
    parser.add_argument("--min-per-class", type=int, default=DEFAULT_MIN_PER_CLASS,
                        help="Mínimo de casos de la clase minoritaria de abandono en cada cohorte.")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        result = run(args)
    except TrainingError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2
    print(f"Borrador generado en {result['output_dir']} con estado {DRAFT_STATUS}.")
    print("Pendiente: revisión clínica humana y creación/firma de treatment-manifest.json (no la hace este script).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
