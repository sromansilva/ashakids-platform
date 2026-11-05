"""Master Orchestrator for AshaKids AI Harness."""

import json
import os
import sys
import time

# Reconfigure stdout/stderr for UTF-8 compatibility on Windows terminals
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# Ensure ml-service root is in sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from harness.acoustic_benchmark import AcousticBenchmark
from harness.privacy_auditor import PrivacyAuditor
from harness.clinical_guardrails import ClinicalGuardrailsAuditor


def main():
    print("=====================================================================")
    print("[AI HARNESS] ASHAKids - AI Test & Evaluation Harness")
    print("             Benchmarking: Acustica, Privacidad en RAM y Gobernanza")
    print("=====================================================================\n")

    start_total = time.perf_counter()
    report = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "suites": [],
        "overall_score": 0.0,
        "status": "PASSED",
    }

    # 1. Acoustic Benchmark
    print("[1/3] Ejecutando Acoustic Benchmark (Wav2Vec 2.0)...")
    try:
        acoustic = AcousticBenchmark()
        acoustic_res = acoustic.run()
        report["suites"].append(acoustic_res)
        for t in acoustic_res["tests"]:
            icon = "[PASS]" if t["passed"] else "[FAIL]"
            lat = f" ({t['latency_ms']}ms)" if "latency_ms" in t else ""
            print(f"   {icon} {t['test']}{lat}")
    except Exception as exc:
        print(f"   [FAIL] Error en Acoustic Benchmark: {exc}")
        report["suites"].append({"name": "Acoustic Benchmark", "passed": False, "error": str(exc), "tests": []})

    # 2. Privacy & Memory Leak Auditor
    print("\n[2/3] Ejecutando Privacy & RAM Erasure Auditor (Ley 29733 / HIPAA)...")
    try:
        privacy = PrivacyAuditor()
        privacy_res = privacy.run()
        report["suites"].append(privacy_res)
        for t in privacy_res["tests"]:
            icon = "[PASS]" if t["passed"] else "[FAIL]"
            print(f"   {icon} {t['test']} -> {t.get('detail', '')}")
    except Exception as exc:
        print(f"   [FAIL] Error en Privacy Auditor: {exc}")
        report["suites"].append({"name": "Privacy Auditor", "passed": False, "error": str(exc), "tests": []})

    # 3. Clinical Guardrails & Governance
    print("\n[3/3] Ejecutando Clinical Guardrails & Human-in-the-Loop Auditor...")
    try:
        guardrails = ClinicalGuardrailsAuditor()
        guardrails_res = guardrails.run()
        report["suites"].append(guardrails_res)
        for t in guardrails_res["tests"]:
            icon = "[PASS]" if t["passed"] else "[FAIL]"
            print(f"   {icon} {t['test']} -> {t.get('detail', '')}")
    except Exception as exc:
        print(f"   [FAIL] Error en Clinical Guardrails: {exc}")
        report["suites"].append({"name": "Clinical Guardrails", "passed": False, "error": str(exc), "tests": []})

    # Summary Calculations
    total_tests = 0
    passed_tests = 0
    all_suites_passed = True

    for s in report["suites"]:
        if not s.get("passed", False):
            all_suites_passed = False
        for t in s.get("tests", []):
            total_tests += 1
            if t.get("passed", False):
                passed_tests += 1

    score = (passed_tests / total_tests * 100.0) if total_tests > 0 else 0.0
    report["overall_score"] = round(score, 1)
    report["total_tests"] = total_tests
    report["passed_tests"] = passed_tests
    report["status"] = "PASSED" if all_suites_passed else "FAILED"
    report["duration_seconds"] = round(time.perf_counter() - start_total, 2)

    # Save Report JSON
    repo_root = os.path.dirname(parent_dir)
    output_dir = os.path.join(repo_root, "output")
    os.makedirs(output_dir, exist_ok=True)
    report_file = os.path.join(output_dir, "ai_harness_report.json")
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print("\n=====================================================================")
    print("AI SCORECARD & CERTIFICACION DE CALIDAD")
    print("=====================================================================")
    print(f"* Puntuacion Global:     {report['overall_score']} / 100")
    print(f"* Pruebas Exitosas:      {passed_tests} / {total_tests}")
    print(f"* Estado del Certificado: {'[CERTIFICADO]' if all_suites_passed else '[NO CONFORME]'}")
    print(f"* Tiempo de Ejecucion:   {report['duration_seconds']}s")
    print(f"* Reporte persistido en: {report_file}")
    print("=====================================================================\n")

    sys.exit(0 if all_suites_passed else 1)


if __name__ == "__main__":
    main()
