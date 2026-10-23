"""Package the Sound Workshop's matching 3D animal characters as web assets."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "frontend" / "public" / "sounds" / "animals"
SOURCE = ROOT / "docs" / "evidence" / "sounds-v112" / "art-source"
EVIDENCE = ROOT / "docs" / "evidence" / "sounds-v112" / "art-assets.json"

ANIMALS = {
    "cow": "Vaca de juguete blanca con manchas, hocico rosado y campanita dorada.",
    "cat": "Gato naranja de juguete con rayas suaves y cola curva.",
    "dog": "Perro crema de juguete con orejas caídas, mancha caramelo y lengua sonriente.",
    "chick": "Pollito amarillo de juguete con pico y patas naranjas.",
}


def main() -> None:
    records = []
    for animal_id, description in ANIMALS.items():
        source = SOURCE / f"{animal_id}.png"
        if not source.is_file():
            raise FileNotFoundError(f"Missing source illustration: {source}")

        with Image.open(source) as opened:
            image = opened.convert("RGBA")
            alpha = image.getchannel("A")
            alpha = alpha.point(lambda value: 255 if value >= 12 else 0)
            bounds = alpha.getbbox()
            if not bounds:
                raise ValueError(f"Illustration has no visible pixels: {source}")
            image = image.crop(bounds)
            image.thumbnail((350, 350), Image.Resampling.LANCZOS)
            canvas = Image.new("RGBA", (384, 384), (0, 0, 0, 0))
            canvas.alpha_composite(image, ((384 - image.width) // 2, (384 - image.height) // 2))
            output = PUBLIC / f"{animal_id}-v112.webp"
            canvas.save(output, format="WEBP", quality=88, method=6, lossless=False, exact=True)

        records.append(
            {
                "id": animal_id,
                "source": source.relative_to(ROOT).as_posix(),
                "sourceSha256": hashlib.sha256(source.read_bytes()).hexdigest(),
                "output": output.relative_to(ROOT).as_posix(),
                "outputSha256": hashlib.sha256(output.read_bytes()).hexdigest(),
                "bytes": output.stat().st_size,
                "dimensions": "384x384 RGBA WebP",
                "description": description,
                "generation": "Generated character illustration for ASHAKids Sound Workshop, 2026-10-19.",
            }
        )

    EVIDENCE.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total_bytes = sum(record["bytes"] for record in records)
    print(f"Packaged {len(records)} animal illustrations ({total_bytes:,} optimized bytes).")


if __name__ == "__main__":
    main()
