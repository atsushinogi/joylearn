"""Upload original-color SVGs before switching the game, then remove old SVGs."""

from __future__ import annotations

import argparse
import csv
from ftplib import FTP, error_perm, error_temp
from pathlib import Path

from dotenv import dotenv_values


ROOT = Path(__file__).resolve().parent
SITE_ROOT = ROOT.parent
HOST = "netftp.asahi-net.or.jp"
USER = "fk5a-ng"
REMOTE_ROOT = "homepage"
TARGET_DIR = ROOT / "pokemon_svg_color_256"
DATA_JS = ROOT / "typing-game" / "pokemon-data.js"


def names() -> list[str]:
    with (ROOT / "pokemon_list.csv").open(encoding="utf-8", newline="") as handle:
        filenames = [row["filename"] for row in csv.DictReader(handle)]
    assert len(filenames) == 1299 and len(set(filenames)) == len(filenames)
    assert {path.name for path in TARGET_DIR.glob("*.svg")} == set(filenames)
    data = DATA_JS.read_text(encoding="utf-8")
    assert data.count("../pokemon_svg_color_256/") == len(filenames)
    assert "../pokemon_svg_69/" not in data
    return filenames


def remote_names(ftp: FTP) -> set[str]:
    try:
        return {Path(name).name for name in ftp.nlst()}
    except error_perm as error:
        if str(error).startswith("550"):
            return set()
        raise


def connect() -> FTP:
    password = dotenv_values(SITE_ROOT / ".env").get("FTP_PASSWORD")
    if not password:
        raise RuntimeError("FTP_PASSWORD is missing from .env")
    ftp = FTP(timeout=60)
    ftp.connect(HOST, 21)
    ftp.login(USER, password)
    ftp.cwd(REMOTE_ROOT)
    return ftp


def upload(ftp: FTP, filenames: list[str]) -> None:
    base = ftp.pwd()
    ftp.cwd("poketyping")
    try:
        ftp.cwd("pokemon_svg_color_256")
    except error_perm:
        ftp.mkd("pokemon_svg_color_256")
        ftp.cwd("pokemon_svg_color_256")
    ftp.voidcmd("TYPE I")
    existing = remote_names(ftp)
    uploaded = 0
    for index, filename in enumerate(filenames, 1):
        local = TARGET_DIR / filename
        same_size = False
        if filename in existing:
            try:
                same_size = ftp.size(filename) == local.stat().st_size
            except error_perm:
                pass
        if not same_size:
            with local.open("rb") as source:
                ftp.storbinary(f"STOR {filename}", source)
            uploaded += 1
        if index % 100 == 0 or index == len(filenames):
            print(f"SVG checked: {index}/{len(filenames)}; uploaded: {uploaded}", flush=True)
    if not set(filenames) <= remote_names(ftp):
        raise RuntimeError("Remote SVG directory is incomplete")

    # Switch the game only after every SVG is present.
    ftp.cwd(base)
    ftp.cwd("poketyping/typing-game")
    with DATA_JS.open("rb") as source:
        ftp.storbinary("STOR pokemon-data.js", source)
    with (ROOT / "typing-game" / "script.js").open("rb") as source:
        ftp.storbinary("STOR script.js", source)
    with (ROOT / "typing-game" / "index.html").open("rb") as source:
        ftp.storbinary("STOR index.html", source)
    ftp.cwd(base)
    with (SITE_ROOT / "index.html").open("rb") as source:
        ftp.storbinary("STOR index.html", source)
    print("Uploaded game data, typing logic, and both entry pages after all SVGs", flush=True)


def cleanup(ftp: FTP, filenames: list[str]) -> None:
    base = ftp.pwd()
    ftp.cwd("poketyping/pokemon_svg_color_256")
    if not set(filenames) <= remote_names(ftp):
        raise RuntimeError("New SVG set is incomplete; keeping the old set")
    ftp.cwd(base)
    ftp.cwd("poketyping/typing-game")
    contents = bytearray()
    ftp.retrbinary("RETR pokemon-data.js", contents.extend)
    if contents.count(b"../pokemon_svg_color_256/") != len(filenames):
        raise RuntimeError("The remote game still references the old SVGs")
    ftp.cwd(base)
    ftp.cwd("poketyping/pokemon_svg_69")
    old_names = remote_names(ftp)
    obsolete = sorted(old_names & set(filenames))
    for index, filename in enumerate(obsolete, 1):
        ftp.delete(filename)
        if index % 100 == 0 or index == len(obsolete):
            print(f"Old SVGs removed: {index}/{len(obsolete)}", flush=True)
    ftp.cwd(base)
    try:
        ftp.rmd("poketyping/pokemon_svg_69")
    except error_perm:
        pass


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    actions = parser.add_mutually_exclusive_group(required=True)
    actions.add_argument("--upload", action="store_true")
    actions.add_argument("--cleanup-old", action="store_true")
    args = parser.parse_args()
    filenames = names()
    if args.upload:
        for attempt in range(1, 6):
            try:
                with connect() as ftp:
                    upload(ftp, filenames)
                break
            except (OSError, EOFError, error_temp) as error:
                if attempt == 5:
                    raise
                print(f"FTP interrupted ({type(error).__name__}); resuming transfer", flush=True)
    else:
        with connect() as ftp:
            cleanup(ftp, filenames)


if __name__ == "__main__":
    main()
