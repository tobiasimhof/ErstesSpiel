"""Erzeugt die App-Symbole (assets/icons/icon-192.png und icon-512.png).

Aufruf aus dem Projektordner:  python3 tools/make-icons.py
Benötigt Pillow (PIL).
"""

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "icons"

WOOD = (59, 42, 26)
GRASS = (127, 163, 90)
PARCHMENT = (243, 230, 196)
ROOF = (181, 118, 58)
DOOR = (74, 52, 35)
BELT = (60, 60, 64)
BELT_STRIPE = (110, 110, 116)
CRATE = (160, 110, 60)


def draw_icon(size: int = 512) -> Image.Image:
    s = size / 512
    img = Image.new("RGB", (size, size), WOOD)
    d = ImageDraw.Draw(img)

    # Wiese
    d.rounded_rectangle([40 * s, 40 * s, 472 * s, 472 * s], radius=60 * s, fill=GRASS)

    # Förderband unten
    d.rectangle([40 * s, 368 * s, 472 * s, 424 * s], fill=BELT)
    for x in range(40, 472, 36):
        d.polygon(
            [(x * s, 424 * s), ((x + 14) * s, 368 * s), ((x + 26) * s, 368 * s), ((x + 12) * s, 424 * s)],
            fill=BELT_STRIPE,
        )
    # Kiste auf dem Band
    d.rectangle([330 * s, 322 * s, 382 * s, 374 * s], fill=CRATE, outline=DOOR, width=max(1, int(5 * s)))

    # Laden: Haus mit Dach
    d.rectangle([132 * s, 196 * s, 316 * s, 352 * s], fill=PARCHMENT, outline=DOOR, width=max(1, int(6 * s)))
    d.polygon([(110 * s, 204 * s), (224 * s, 104 * s), (338 * s, 204 * s)], fill=ROOF, outline=DOOR)
    d.rectangle([200 * s, 270 * s, 248 * s, 352 * s], fill=DOOR)
    d.rectangle([150 * s, 222 * s, 186 * s, 256 * s], fill=DOOR)
    d.rectangle([262 * s, 222 * s, 298 * s, 256 * s], fill=DOOR)
    return img


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    big = draw_icon(512)
    big.save(OUT / "icon-512.png")
    big.resize((192, 192), Image.LANCZOS).save(OUT / "icon-192.png")
    print("Icons gespeichert in", OUT)


if __name__ == "__main__":
    main()
