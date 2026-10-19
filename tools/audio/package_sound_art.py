"""Package the generated Sound Workshop illustrations as optimized web assets."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "frontend" / "public" / "sounds" / "games"
SOURCE = ROOT / "docs" / "evidence" / "sounds-v108" / "art-source"
EVIDENCE = ROOT / "docs" / "evidence" / "sounds-v108" / "art-assets.json"

ART = {
    "sound-same": {
        "file": "exec-351660ca-4e64-4cfc-a1b3-9bc45d558df2.png",
        "scene": "Tres bocinas de juguete con una vaca, un gato y un pollito; lupa para comparar sus sonidos.",
        "alt": "Bocinas de juguete con una vaca, un gato y un pollito para comparar sonidos",
    },
    "sound-sequence": {
        "file": "exec-32a185c9-61e3-411e-9174-2938d95fbc95.png",
        "scene": "Tren de juguete pastel con una vaca, un gato y un pollito en sus vagones.",
        "alt": "Tren de juguete con una vaca, un gato y un pollito",
    },
    "sound-count": {
        "file": "exec-72fecd10-8591-4798-a029-1297bec0a972.png",
        "scene": "Gato naranja junto a una radio infantil y tres cuentas musicales de colores.",
        "alt": "Gato de juguete junto a una radio y tres cuentas de colores para contar sonidos",
    },
    "sound-memory": {
        "file": "exec-45026627-5e1c-4f55-8946-cb5f821bc796.png",
        "scene": "Cuatro tarjetas acolchadas: dos pollitos y dos notas musicales para parejas de memoria.",
        "alt": "Tarjetas suaves con pollitos y notas musicales para encontrar parejas",
    },
    "sound-missing": {
        "file": "exec-6605de44-baf3-44c9-9e04-dbac48371a54.png",
        "scene": "Vaca y gato de juguete junto a un hueco con forma de pollito y la pieza del pollito.",
        "alt": "Rompecabezas de sonidos con una vaca, un gato y la pieza del pollito que falta",
    },
    "sound-order": {
        "file": "exec-4b7a8371-95c5-4680-830c-15234043753d.png",
        "scene": "Camino de piedras de colores con un gato, un perro, un pollito y una bandera de meta.",
        "alt": "Camino de colores para ordenar los sonidos de un gato, un perro y un pollito",
    },
    "sound-odd": {
        "file": "exec-b3fef261-f532-45b4-a91d-ad40cf06d182.png",
        "scene": "Gato amigable y bocina redonda con tres perforaciones musicales de colores.",
        "alt": "Gato naranja junto a una bocina musical de juguete para descubrir el sonido diferente",
    },
}


def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    SOURCE.mkdir(parents=True, exist_ok=True)
    records = []
    for game_id, item in ART.items():
        source = SOURCE / f"{game_id}.png"
        if not source.is_file():
            raise FileNotFoundError(f"Missing source illustration: {source}")

        with Image.open(source) as opened:
            image = opened.convert("RGBA")
            alpha = image.getchannel("A")
            # Trim transparent margins and small antialiasing specks before fitting.
            alpha = alpha.point(lambda value: 255 if value >= 12 else 0)
            bounds = alpha.getbbox()
            if bounds:
                image = image.crop(bounds)
            image.thumbnail((350, 350), Image.Resampling.LANCZOS)
            canvas = Image.new("RGBA", (384, 384), (0, 0, 0, 0))
            canvas.alpha_composite(image, ((384 - image.width) // 2, (384 - image.height) // 2))
            output = PUBLIC / f"{game_id}-v108.webp"
            canvas.save(output, format="WEBP", quality=88, method=6, lossless=False, exact=True)

        records.append(
            {
                "id": game_id,
                "source": source.relative_to(ROOT).as_posix(),
                "sourceSha256": hashlib.sha256(source.read_bytes()).hexdigest(),
                "output": output.relative_to(ROOT).as_posix(),
                "outputSha256": hashlib.sha256(output.read_bytes()).hexdigest(),
                "bytes": output.stat().st_size,
                "dimensions": "384x384 RGBA WebP",
                "description": item["scene"],
                "alt": item["alt"],
                "generation": "Generated illustration for ASHAKids Sound Workshop, 2026-10-19.",
            }
        )
    EVIDENCE.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Packaged {len(records)} illustrations ({sum(item['bytes'] for item in records):,} optimized bytes).")


if __name__ == "__main__":
    main()
