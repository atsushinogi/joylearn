#!/usr/bin/env python3
"""Preview or upload website files changed since the last upload, with optional cleanup."""
import argparse
import datetime
import ftplib
import getpass
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent
HOST = "netftp.asahi-net.or.jp"
USER = "fk5a-ng"
REMOTE = "homepage"
# Paths, sizes and SHA256 of the files last uploaded; the leading dot keeps it off the server.
MANIFEST = ROOT / ".ftp-manifest.json"
WEB_EXTENSIONS = {".html", ".htm", ".js", ".css"}
ASSET_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".svg", ".ico",
    ".woff", ".woff2", ".ttf", ".otf", ".mp3", ".wav", ".ogg",
    ".mp4", ".webm", ".json", ".webmanifest", ".wasm", ".mjs", ".txt",
}


def public_files(root):
    root = root.resolve()
    # Lesson 4/6 production records, backups and format comparisons stay local.
    local_only = {
        root / "quiz/social-studies-2-lesson4/icon-production",
        root / "quiz/social-studies-2-lesson4/icon-assets/backups",
        root / "quiz/social-studies-2-lesson4/icon-assets/comparison.html",
        root / "quiz/social-studies-2-lesson6/icon-production",
        root / "quiz/social-studies-2-lesson6/icon-assets/backups",
        root / "quiz/social-studies-2-lesson6/icon-assets/comparison.html",
        # Download-only PNG copies of the Jujutsu Kaisen workbook images; pages display WebP.
        root / "kanji-50/jujutsu-kaisen/exports/v2/png",
    }
    candidates = {
        p for p in root.rglob("*")
        if p.is_file()
        and not any(part.startswith(".") or part == "__pycache__"
                    for part in p.relative_to(root).parts)
        and not any(part.is_symlink() for part in (p, *p.parents))
        and not any(path == p or path in p.parents for path in local_only)
    }
    selected = {p for p in candidates if p.suffix.lower() in WEB_EXTENSIONS}
    pending = list(selected)
    while pending:
        source = pending.pop()
        if source.suffix.lower() not in WEB_EXTENSIONS | {".mjs", ".svg", ".json", ".webmanifest"}:
            continue
        if source.parent in {
            root / "poketyping/pokemon_svg",
            root / "poketyping/pokemon_chibi_svg",
            root / "poketyping/pokemon_svg_69",
            root / "poketyping/pokemon_svg_color_256",
        }:
            continue  # Generated SVGs are self-contained and have no linked assets.
        # Read literal paths in HTML attributes, JS strings and CSS url().
        references = re.findall(r'''["']([^"'\n<>]+)["']|url\(\s*([^\s)"']+)\s*\)''',
                                source.read_text(encoding="utf-8"))
        for quoted, css_url in references:
            try:
                url = urlsplit(quoted or css_url)
            except ValueError:
                continue
            if url.scheme or url.netloc or not url.path:
                continue
            path = unquote(url.path)
            target = ((root / path.lstrip("/")) if path.startswith("/")
                      else source.parent / path).resolve()
            if (target in candidates and target not in selected
                    and target.suffix.lower() in ASSET_EXTENSIONS):
                selected.add(target)
                pending.append(target)
    return sorted(selected)


def file_record(path):
    digest = hashlib.sha256()
    with path.open("rb") as content:
        for chunk in iter(lambda: content.read(1 << 20), b""):
            digest.update(chunk)
    return {"size": path.stat().st_size, "sha256": digest.hexdigest()}


def load_manifest():
    if not MANIFEST.exists():
        return None
    return json.loads(MANIFEST.read_text(encoding="utf-8"))["files"]


def save_manifest(records):
    data = {"host": HOST, "remote": REMOTE,
            "updated": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
            "files": dict(sorted(records.items()))}
    temporary = MANIFEST.with_suffix(".tmp")
    temporary.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    temporary.replace(MANIFEST)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--upload", action="store_true", help="connect and upload files")
    parser.add_argument("--full", action="store_true",
                        help="upload every public file instead of only files changed since the last upload")
    parser.add_argument("--delete-removed", action="store_true",
                        help="with --upload, delete remote files recorded in the manifest that are no longer public")
    parser.add_argument("--record-only", action="store_true",
                        help="write the manifest from the current files without connecting (server already matches)")
    parser.add_argument("--list", action="store_true", help="print every selected file")
    parser.add_argument("--tls", action="store_true", help="use explicit FTPS if supported")
    parser.add_argument("--delete-obsolete-pokemon-png", action="store_true",
                        help="after upload, delete old Pokemon PNGs replaced by local WebP files (implies --full)")
    parser.add_argument("--delete-obsolete-pokemon-raster", action="store_true",
                        help="after SVG upload, delete matching old Pokemon PNG and WebP files (implies --full)")
    args = parser.parse_args()
    pokemon_cleanup = args.delete_obsolete_pokemon_png or args.delete_obsolete_pokemon_raster
    if pokemon_cleanup and not args.upload:
        parser.error("Pokemon image cleanup requires --upload")
    if args.delete_removed and not args.upload:
        parser.error("--delete-removed requires --upload")
    if args.record_only and args.upload:
        parser.error("--record-only cannot be combined with --upload")
    if pokemon_cleanup:
        args.full = True  # Cleanup runs per uploaded file, so every file must be sent.

    files = public_files(ROOT)
    records = {path.relative_to(ROOT).as_posix(): file_record(path) for path in files}
    previous = load_manifest()
    print(f"Destination: {HOST}/{REMOTE}/")
    if args.record_only:
        save_manifest(records)
        print(f"Recorded {len(records)} files in {MANIFEST.name}. Nothing was uploaded.")
        return
    if args.full or previous is None:
        if previous is None and not args.full:
            print(f"No {MANIFEST.name} yet: every file will be uploaded.")
        changed = list(files)
    else:
        changed = [path for path in files
                   if previous.get(path.relative_to(ROOT).as_posix()) != records[path.relative_to(ROOT).as_posix()]]
    removed = sorted(set(previous or {}) - set(records))
    for path in (files if args.list else changed):
        print(f"  {path.relative_to(ROOT).as_posix()} ({path.stat().st_size} bytes)")
    print(f"{len(files)} public files; {len(changed)} to upload.")
    if removed:
        action = "will be deleted" if args.delete_removed else "are no longer public (add --delete-removed to delete them)"
        print(f"{len(removed)} previously uploaded files {action}:")
        for name in removed:
            print(f"  - {name}")
    if not args.upload:
        print("Preview only. Run with --upload to transfer these files.")
        return
    if not changed and not (args.delete_removed and removed):
        print("Nothing to upload.")
        return
    password = getpass.getpass(f"FTP password for {USER}: ")
    client_type = ftplib.FTP_TLS if args.tls else ftplib.FTP

    def connect():
        client = client_type(timeout=60)
        client.connect(HOST, 21)
        client.login(USER, password)
        if args.tls:
            client.prot_p()
        client.cwd(REMOTE)
        return client

    # Start from the last manifest and record each confirmed upload, so an
    # interrupted run resumes with only the files that were not sent yet.
    uploaded = dict(previous or {})
    ftp = connect()
    try:
        base = ftp.pwd()
        old_pokemon_rasters = set()
        if args.delete_obsolete_pokemon_png or args.delete_obsolete_pokemon_raster:
            try:
                ftp.cwd("poketyping/pokemon_images")
            except ftplib.error_perm:
                pass  # The image directory may not exist on a first upload.
            else:
                old_pokemon_rasters = {
                    Path(name).name for name in ftp.nlst()
                    if name.lower().endswith((".png", ".webp"))
                }
                ftp.cwd(base)
        for number, path in enumerate(changed, 1):
            relative = path.relative_to(ROOT)
            key = relative.as_posix()
            for attempt in range(5):
                try:
                    ftp.cwd(base)
                    for part in relative.parts[:-1]:
                        try:
                            ftp.cwd(part)
                        except ftplib.error_perm:
                            ftp.mkd(part)
                            ftp.cwd(part)
                    with path.open("rb") as source:
                        ftp.storbinary(f"STOR {relative.name}", source)
                    if ftp.size(relative.name) != records[key]["size"]:
                        raise SystemExit(f"Size mismatch after upload: {key}")
                    break
                except (OSError, EOFError, ftplib.error_temp) as error:
                    if attempt == 4:
                        raise
                    print(f"Retrying {key} after {type(error).__name__}")
                    try:
                        ftp.close()
                    except OSError:
                        pass
                    ftp = connect()
            uploaded[key] = records[key]
            if number % 50 == 0:
                save_manifest(uploaded)
            print(f"Uploaded ({number}/{len(changed)}): {key}")
            if (args.delete_obsolete_pokemon_png
                    and path.parent == ROOT / "poketyping/pokemon_images"
                    and path.suffix == ".webp"):
                old_name = path.with_suffix(".png").name
                if old_name in old_pokemon_rasters:
                    ftp.delete(old_name)
                    print(f"Deleted obsolete: poketyping/pokemon_images/{old_name}")
            if (args.delete_obsolete_pokemon_raster
                    and path.parent == ROOT / "poketyping/pokemon_svg"
                    and path.suffix == ".svg"):
                old_names = [f"{path.stem}{suffix}" for suffix in (".png", ".webp")]
                if any(name in old_pokemon_rasters for name in old_names):
                    ftp.cwd(base)
                    ftp.cwd("poketyping/pokemon_images")
                    for old_name in old_names:
                        if old_name in old_pokemon_rasters:
                            ftp.delete(old_name)
                            print(f"Deleted obsolete: poketyping/pokemon_images/{old_name}")
                    ftp.cwd(base)
        if args.delete_removed:
            emptied = set()
            for name in removed:
                try:
                    ftp.delete(f"{base}/{name}")
                    print(f"Deleted removed file: {name}")
                except ftplib.error_perm as error:
                    print(f"Could not delete {name}: {error}")
                    continue
                uploaded.pop(name, None)
                emptied.update(str(parent) for parent in Path(name).parents if str(parent) != ".")
            for folder in sorted(emptied, key=lambda name: name.count("/"), reverse=True):
                try:
                    ftp.rmd(f"{base}/{folder}")
                    print(f"Removed empty folder: {folder}")
                except ftplib.error_perm:
                    pass  # The folder still holds other files.
    finally:
        save_manifest(uploaded)
        try:
            ftp.quit()
        except (OSError, EOFError, ftplib.Error):
            ftp.close()
    print(f"Done. {MANIFEST.name} records {len(uploaded)} uploaded files.")


if __name__ == "__main__":
    main()
