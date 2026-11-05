"""Acoustic Benchmark Suite: Latency, duration compliance and acoustic inference testing."""

import io
import time
from typing import Any, Dict, List
import numpy as np
import soundfile as sf

from wav2vec_engine import (
    Wav2VecPhoneticEngine,
    MIN_PHONETIC_SAMPLE_SECONDS,
    MAX_PHONETIC_SAMPLE_SECONDS,
)


def generate_test_wav(duration_seconds: float, sample_rate: int = 16000, frequency: float = 440.0) -> bytes:
    """Generate a clean synthetic mono PCM WAV buffer in RAM without touching disk."""
    total_samples = int(duration_seconds * sample_rate)
    t = np.linspace(0, duration_seconds, total_samples, endpoint=False, dtype=np.float32)
    # Generate multi-harmonic signal resembling speech formants
    audio = 0.4 * np.sin(2 * np.pi * frequency * t) + 0.2 * np.sin(2 * np.pi * (frequency * 2) * t)
    buffer = io.BytesIO()
    sf.write(buffer, audio.astype(np.float32), sample_rate, format="WAV", subtype="PCM_16")
    return buffer.getvalue()


class AcousticBenchmark:
    """Runs latency, duration boundary and inference benchmarks on Wav2Vec 2.0."""

    TARGET_WORDS = [
        {"word": "carro", "phoneme": "/rr/"},
        {"word": "ratón", "phoneme": "/r/"},
        {"word": "zapato", "phoneme": "/s/"},
        {"word": "plato", "phoneme": "/pl/"},
        {"word": "tren", "phoneme": "/tr/"},
    ]

    def __init__(self, engine: Wav2VecPhoneticEngine | None = None):
        self.engine = engine or Wav2VecPhoneticEngine()
        if not self.engine._is_ready:
            self.engine.initialize()

    def run(self) -> Dict[str, Any]:
        results: Dict[str, Any] = {
            "name": "Acoustic Benchmark (Wav2Vec 2.0)",
            "passed": True,
            "metrics": {},
            "tests": [],
        }

        # 1. Test Duration Guard: Reject samples < 2.0s
        short_wav = generate_test_wav(1.5)
        try:
            self.engine.inferir_fonetica(short_wav, "carro", "/rr/")
            results["tests"].append({
                "test": "reject_too_short_audio (< 2.0s)",
                "passed": False,
                "detail": "Failed: Engine accepted 1.5s audio when minimum is 2.0s.",
            })
            results["passed"] = False
        except ValueError as err:
            results["tests"].append({
                "test": "reject_too_short_audio (< 2.0s)",
                "passed": True,
                "detail": f"Correctly rejected short sample: {err}",
            })

        # 2. Test Duration Guard: Reject samples > 3.0s
        long_wav = generate_test_wav(3.5)
        try:
            self.engine.inferir_fonetica(long_wav, "carro", "/rr/")
            results["tests"].append({
                "test": "reject_too_long_audio (> 3.0s)",
                "passed": False,
                "detail": "Failed: Engine accepted 3.5s audio when maximum is 3.0s.",
            })
            results["passed"] = False
        except ValueError as err:
            results["tests"].append({
                "test": "reject_too_long_audio (> 3.0s)",
                "passed": True,
                "detail": f"Correctly rejected long sample: {err}",
            })

        # 3. Latency & Neural Forward Pass Benchmark for all 5 target words
        latencies: List[float] = []

        for target in self.TARGET_WORDS:
            wav_bytes = generate_test_wav(2.2, frequency=300.0)
            start_time = time.perf_counter()
            try:
                # Real forward pass through Wav2Vec2 neural architecture
                res = self.engine.inferir_audio(wav_bytes)
                elapsed_ms = (time.perf_counter() - start_time) * 1000
                latencies.append(elapsed_ms)
                results["tests"].append({
                    "test": f"neural_inference_{target['word']}_{target['phoneme']}",
                    "passed": True,
                    "latency_ms": round(elapsed_ms, 2),
                    "target": target["word"],
                    "neural_active": res.get("motor_red_neuronal_activa", False),
                })
            except Exception as exc:
                results["tests"].append({
                    "test": f"neural_inference_{target['word']}_{target['phoneme']}",
                    "passed": False,
                    "detail": str(exc),
                })
                results["passed"] = False

        if latencies:
            latencies_sorted = sorted(latencies)
            p50 = np.percentile(latencies_sorted, 50)
            p95 = np.percentile(latencies_sorted, 95)
            max_lat = max(latencies_sorted)

            latency_ok = bool(p95 < 1500.0)
            results["metrics"] = {
                "samples_evaluated": len(latencies),
                "p50_latency_ms": round(float(p50), 2),
                "p95_latency_ms": round(float(p95), 2),
                "max_latency_ms": round(float(max_lat), 2),
                "latency_target_met": latency_ok,
            }

            results["tests"].append({
                "test": "latency_under_1500ms_p95",
                "passed": latency_ok,
                "detail": f"P95: {round(float(p95), 2)}ms (SLA: < 1500ms)",
            })
            if not latency_ok:
                results["passed"] = False

        return results
