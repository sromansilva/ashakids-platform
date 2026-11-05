"""Pruebas del entrenamiento del pronóstico con datos ficticios creados solo aquí."""

import csv
import hashlib
import json
import os
import random
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import train_predictive_model as trainer
from treatment_predictor import FEATURE_NAMES, TreatmentPredictionInput, TreatmentPredictor

HEADER = [*FEATURE_NAMES, "sesiones_hasta_alta", "abandono"]


def make_rows(count, seed, offset=0):
    rng = random.Random(seed)
    rows = []
    seen = set()
    while len(rows) < count:
        features = [
            rng.randint(24, 180),
            rng.randint(1, 5),
            rng.randint(1, 5),
            rng.randint(1, 5),
            rng.randint(1, 3),
        ]
        sessions = max(1, min(31, 6 + features[2] * 2 + (5 - features[3]) + rng.randint(0, 3) + offset))
        dropout = 1 if (features[3] <= 2 and rng.random() < 0.7) or rng.random() < 0.1 else 0
        row = tuple(features + [sessions, dropout])
        if row in seen:
            continue
        seen.add(row)
        rows.append(list(row))
    return rows


def write_csv(path, rows, header=None):
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(header or HEADER)
        writer.writerows(rows)


class TrainPredictiveModelTests(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.root = Path(self._tmp.name)
        self.train = self.root / "train.csv"
        self.validation = self.root / "validation.csv"
        self.codebook = self.root / "codebook.json"
        self.codebook.write_text(
            json.dumps({str(c): f"Etiqueta ficticia {c}" for c in range(1, 6)}), encoding="utf-8"
        )
        rows = make_rows(180, seed=1)
        write_csv(self.train, rows[:120])
        write_csv(self.validation, rows[120:])
        self.out = self.root / "out"

    def tearDown(self):
        self._tmp.cleanup()

    def args(self, **overrides):
        values = [
            "--train-csv", str(self.train),
            "--validation-csv", str(self.validation),
            "--output-dir", str(self.out),
            "--dataset-version", "ficticia-1",
            "--diagnosis-codebook", str(self.codebook),
            "--min-train-samples", "50",
            "--min-validation-samples", "30",
            "--min-per-class", "5",
            "--min-completed", "5",
        ]
        for key, value in overrides.items():
            flag = "--" + key.replace("_", "-")
            values[values.index(flag) + 1] = value
        return values

    def assert_fails_without_output(self, message, argv=None):
        code = trainer.main(argv or self.args())
        self.assertEqual(code, 2)
        self.assertFalse(self.out.exists() and any(self.out.iterdir()), message)

    def test_validation_errors_produce_no_artifacts(self):
        base = make_rows(180, seed=2)

        write_csv(self.train, [r[:-1] + [2] for r in base[:120]])
        with self.subTest("abandono fuera de 0/1"):
            self.assert_fails_without_output("abandono")

        write_csv(self.train, [r[:5] + [32, r[6]] for r in base[:120]])
        with self.subTest("sesiones fuera de rango"):
            self.assert_fails_without_output("sesiones")

        bad = [list(r) for r in base[:120]]
        bad[0][0] = 10
        write_csv(self.train, bad)
        with self.subTest("edad fuera de rango"):
            self.assert_fails_without_output("edad")

        bad = [list(r) for r in base[:120]]
        bad[3] = ["" for _ in bad[3]]
        bad[4][1] = ""
        write_csv(self.train, bad)
        with self.subTest("nulos"):
            self.assert_fails_without_output("nulos")

        write_csv(self.train, [r[:-1] + [0] for r in base[:120]])
        with self.subTest("una sola clase"):
            self.assert_fails_without_output("clase")

        write_csv(self.train, base[:120])
        write_csv(self.validation, base[:40])
        with self.subTest("filas compartidas"):
            self.assert_fails_without_output("compartidas")

        write_csv(self.validation, base[120:])
        with self.subTest("mínimo de muestras"):
            self.assert_fails_without_output("minimo", self.args(min_train_samples="500"))

    def test_rejects_direct_identifier_columns(self):
        rows = make_rows(60, seed=3)
        write_csv(self.train, [[f"Nombre {i}"] + r for i, r in enumerate(rows)], header=["nombre", *HEADER])
        self.assert_fails_without_output("identificadores")
        write_csv(self.train, [[i] + r for i, r in enumerate(rows)], header=["id_paciente", *HEADER])
        self.assert_fails_without_output("identificadores")

    def test_codebook_must_have_codes_one_to_five(self):
        self.codebook.write_text(json.dumps({"1": "a", "2": "b"}), encoding="utf-8")
        self.assert_fails_without_output("catalogo")

    def test_training_writes_only_a_pending_draft_and_predictor_rejects_it(self):
        self.assertEqual(trainer.main(self.args()), 0)
        names = {p.name for p in self.out.iterdir()}
        self.assertEqual(
            names,
            {
                trainer.MODEL_FILE_NAME, trainer.REPORT_JSON_NAME, trainer.REPORT_MD_NAME,
                trainer.CHECKSUMS_NAME, trainer.DRAFT_MANIFEST_NAME,
            },
        )
        self.assertNotIn("treatment-manifest.json", names)

        draft_text = (self.out / trainer.DRAFT_MANIFEST_NAME).read_text(encoding="utf-8")
        draft = json.loads(draft_text)
        self.assertEqual(draft["status"], "PENDING_CLINICAL_REVIEW")
        self.assertEqual(draft["validation"]["reviewed_by"], "")
        self.assertEqual(draft["validation"]["reviewed_at"], "")
        for path in self.out.iterdir():
            if path.suffix in {".json", ".md", ".txt"}:
                self.assertNotIn("APPROVED_FOR_CLINICAL_ASSISTANCE", path.read_text(encoding="utf-8"))
        self.assertNotIn("APPROVED_FOR_CLINICAL_ASSISTANCE", Path(trainer.__file__).read_text(encoding="utf-8"))

        with self.assertRaisesRegex(ValueError, "aprobación clínica"):
            TreatmentPredictor._validate_manifest(draft, self.out)
        with patch.dict(os.environ, {"TREATMENT_MODEL_MANIFEST": str(self.out / trainer.DRAFT_MANIFEST_NAME)}):
            predictor = TreatmentPredictor()
        self.assertFalse(predictor.initialize())

        report = json.loads((self.out / trainer.REPORT_JSON_NAME).read_text(encoding="utf-8"))
        self.assertEqual(report["validation_rows"], 60)
        self.assertEqual(draft["validation"]["sample_count"], 60)
        self.assertEqual(
            draft["validation"]["report_sha256"],
            hashlib.sha256((self.out / trainer.REPORT_JSON_NAME).read_bytes()).hexdigest(),
        )
        self.assertEqual(
            draft["model_sha256"],
            hashlib.sha256((self.out / trainer.MODEL_FILE_NAME).read_bytes()).hexdigest(),
        )

    def test_output_dir_must_be_empty(self):
        self.out.mkdir()
        (self.out / "x.txt").write_text("x", encoding="utf-8")
        self.assertEqual(trainer.main(self.args()), 2)
        self.assertEqual([p.name for p in self.out.iterdir()], ["x.txt"])

    def test_bundle_loads_in_predictor_with_a_temporary_approved_manifest(self):
        self.assertEqual(trainer.main(self.args()), 0)
        draft = json.loads((self.out / trainer.DRAFT_MANIFEST_NAME).read_text(encoding="utf-8"))

        # Aprobación simulada SOLO dentro de la prueba, en un directorio temporal.
        approved_dir = self.root / "approved"
        approved_dir.mkdir()
        for name in (trainer.MODEL_FILE_NAME, trainer.REPORT_JSON_NAME):
            (approved_dir / name).write_bytes((self.out / name).read_bytes())
        approved = json.loads(json.dumps(draft))
        approved["status"] = "APPROVED_FOR_CLINICAL_ASSISTANCE"
        approved["validation"].update(
            reviewed_by="Revisor de prueba",
            reviewed_at="2026-11-01T12:00:00Z",
            independent_cohort=True,
            calibration_verified=True,
            diagnosis_codebook_reviewed=True,
        )
        manifest_path = approved_dir / "treatment-manifest.json"
        manifest_path.write_text(json.dumps(approved), encoding="utf-8")

        with patch.dict(os.environ, {"TREATMENT_MODEL_MANIFEST": str(manifest_path)}):
            predictor = TreatmentPredictor()
        self.assertTrue(predictor.initialize(), predictor._load_error)
        result = predictor.predict(TreatmentPredictionInput(
            edad_meses=60, codigo_diagnostico=2, cantidad_fonemas_afectados=3,
            nivel_colaboracion=2, frecuencia_semanal=2,
        ))
        self.assertGreaterEqual(result.rango_min, 1)
        self.assertLessEqual(result.rango_max, 31)
        self.assertIn(result.riesgo_desercion, {"BAJO", "MEDIO", "ALTO"})

    def test_dropout_rows_do_not_affect_the_sessions_regressor(self):
        rows = make_rows(180, seed=5)
        write_csv(self.train, rows[:120])
        write_csv(self.validation, rows[120:])
        self.assertEqual(trainer.main(self.args()), 0)
        first = json.loads((self.out / trainer.REPORT_JSON_NAME).read_text(encoding="utf-8"))

        scrambled = [list(r) for r in rows]
        for r in scrambled:
            if r[6] == 1:
                r[5] = 31 if r[5] < 16 else 1
        write_csv(self.train, scrambled[:120])
        write_csv(self.validation, scrambled[120:])
        out2 = self.root / "out2"
        argv = self.args(output_dir=str(out2))
        self.assertEqual(trainer.main(argv), 0)
        second = json.loads((out2 / trainer.REPORT_JSON_NAME).read_text(encoding="utf-8"))
        self.assertEqual(first["metrics"]["sessions"], second["metrics"]["sessions"])
        expected_done = sum(1 for r in rows[120:] if r[6] == 0)
        self.assertEqual(first["metrics"]["completed_rows_used_for_sessions"], expected_done)

    def test_min_completed_rows_is_enforced(self):
        self.assert_fails_without_output("altas", self.args(min_completed="500"))

    def test_partial_overlap_is_recorded_but_near_total_copy_is_rejected(self):
        rows = make_rows(180, seed=6)
        write_csv(self.train, rows[:120])
        write_csv(self.validation, rows[110:170])  # 10 de 60 coinciden
        self.assertEqual(trainer.main(self.args()), 0)
        report = json.loads((self.out / trainer.REPORT_JSON_NAME).read_text(encoding="utf-8"))
        self.assertEqual(report["validation_rows_identical_to_train"], 10)
        self.assertAlmostEqual(report["validation_identical_fraction"], 10 / 60, places=3)
        self.assertIn("idénticas a entrenamiento: 10", (self.out / trainer.REPORT_MD_NAME).read_text(encoding="utf-8"))

        out2 = self.root / "out2"
        write_csv(self.validation, rows[0:55] + rows[170:175])  # 55 de 60
        self.assertEqual(trainer.main(self.args(output_dir=str(out2))), 2)
        self.assertFalse(out2.exists())

    def test_identical_csv_hash_is_rejected(self):
        self.validation.write_bytes(self.train.read_bytes())
        self.assert_fails_without_output("hash")

    def test_cli_has_no_option_to_set_status(self):
        parser = trainer.build_parser()
        options = {opt for action in parser._actions for opt in action.option_strings}
        self.assertFalse({o for o in options if "status" in o or "approve" in o})


if __name__ == "__main__":
    unittest.main()
