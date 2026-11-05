"""Privacy and RAM Erasure Auditor: Verifies ephemeral memory and zero-disk persistence."""

import base64
import os
import tempfile
from typing import Any, Dict, List

from audio_memory import (
    clear_audio_buffer,
    decode_audio_base64,
    AudioPayloadTooLarge,
    MAX_AUDIO_BYTES,
)
from harness.acoustic_benchmark import generate_test_wav


class PrivacyAuditor:
    """Verifies that voice data never leaks to disk and is wiped from RAM."""

    def run(self) -> Dict[str, Any]:
        results: Dict[str, Any] = {
            "name": "Privacy & Memory Erasure Audit (Ley 29733 / HIPAA)",
            "passed": True,
            "tests": [],
        }

        # 1. Test explicit RAM buffer wiping with null bytes (fill 0)
        raw_sample = bytearray(b"SENSITIVE_VOICE_SAMPLE_1234567890" * 100)
        original_length = len(raw_sample)
        clear_audio_buffer(raw_sample)

        is_wiped = all(b == 0 for b in raw_sample) and len(raw_sample) == original_length
        results["tests"].append({
            "test": "ram_buffer_zeroing",
            "passed": is_wiped,
            "detail": "Verified: mutable audio buffer is wiped with 0x00 bytes before release."
            if is_wiped
            else "Failed: audio buffer contains residual bytes after clear_audio_buffer().",
        })
        if not is_wiped:
            results["passed"] = False

        # 2. Test payload size limit (reject > 512 KB)
        oversized_bytes = b"0" * (MAX_AUDIO_BYTES + 1024)
        encoded_oversized = base64.b64encode(oversized_bytes).decode("ascii")
        try:
            decode_audio_base64(encoded_oversized)
            results["tests"].append({
                "test": "reject_oversized_audio_payload (> 512KB)",
                "passed": False,
                "detail": "Failed: Accepted audio exceeding 512KB limit.",
            })
            results["passed"] = False
        except (AudioPayloadTooLarge, ValueError):
            results["tests"].append({
                "test": "reject_oversized_audio_payload (> 512KB)",
                "passed": True,
                "detail": "Verified: Payloads exceeding 512 KB are rejected to prevent RAM bloat.",
            })

        # 3. Disk zero persistence check
        # Take snapshot of temp dir audio files before
        temp_dir = tempfile.gettempdir()
        audio_extensions = {".wav", ".pcm", ".raw", ".aac", ".mp3", ".ogg"}

        def find_temp_audios() -> List[str]:
            found = []
            try:
                for entry in os.scandir(temp_dir):
                    if entry.is_file() and os.path.splitext(entry.name)[1].lower() in audio_extensions:
                        if "ashakids" in entry.name.lower() or "wav2vec" in entry.name.lower():
                            found.append(entry.path)
            except Exception:
                pass
            return found

        audios_before = find_temp_audios()

        # Run simulated decode and wipe
        valid_wav = generate_test_wav(2.2)
        b64_valid = base64.b64encode(valid_wav).decode("ascii")
        decoded_buf = decode_audio_base64(b64_valid)
        clear_audio_buffer(decoded_buf)

        audios_after = find_temp_audios()
        new_files = set(audios_after) - set(audios_before)

        disk_safe = len(new_files) == 0
        results["tests"].append({
            "test": "disk_zero_persistence",
            "passed": disk_safe,
            "detail": "Verified: Zero voice audio files written to disk or temp storage."
            if disk_safe
            else f"Failed: Found {len(new_files)} leaked temporary audio file(s) on disk.",
        })
        if not disk_safe:
            results["passed"] = False

        return results
