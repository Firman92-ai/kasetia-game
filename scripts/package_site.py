#!/usr/bin/env python3
"""
Membentuk paket statis siap unggah (artifacts/kasetia-game.zip) sesuai SOP.
Hanya menyertakan berkas runtime: index.html, css/, js/, dan assets/images/.
Dokumentasi, pengujian, konfigurasi pengembangan, dan metadata Git tidak disertakan.
"""

from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "artifacts"
ZIP_PATH = OUT_DIR / "kasetia-game.zip"

RUNTIME_PATHS = [
    ROOT / "index.html",
    ROOT / "css",
    ROOT / "js",
    ROOT / "assets" / "images",
]


def build_package() -> Path:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(ZIP_PATH, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for entry in RUNTIME_PATHS:
            if entry.is_file():
                archive.write(entry, entry.relative_to(ROOT))
            elif entry.is_dir():
                for child in sorted(entry.rglob("*")):
                    if child.is_file():
                        archive.write(child, child.relative_to(ROOT))
    return ZIP_PATH


if __name__ == "__main__":
    output = build_package()
    print(f"Paket statis berhasil dibuat: {output} ({output.stat().st_size} byte)")
