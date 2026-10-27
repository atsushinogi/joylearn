#!/usr/bin/env python3
"""Preview or upload website files. Remote files are never deleted."""
import argparse
import ftplib
import getpass
import re
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent
HOST = "netftp.asahi-net.or.jp"
USER = "fk5a-ng"
REMOTE = "homepage"
WEB_EXTENSIONS = {".html", ".htm", ".js", ".css"}
ASSET_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".svg", ".ico",
    ".woff", ".woff2", ".ttf", ".otf", ".mp3", ".wav", ".ogg",
    ".mp4", ".webm", ".json", ".webmanifest", ".wasm", ".mjs", ".txt",
}


def public_files(root):
    root = root.resolve()
    candidates = {
        p for p in root.rglob("*")
        if p.is_file()
        and not any(part.startswith(".") or part == "__pycache__"
                    for part in p.relative_to(root).parts)
        and not any(part.is_symlink() for part in (p, *p.parents))
    }
    selected = {p for p in candidates if p.suffix.lower() in WEB_EXTENSIONS}
    pending = list(selected)
    while pending:
        source = pending.pop()
        if source.suffix.lower() not in WEB_EXTENSIONS | {".mjs", ".svg", ".json", ".webmanifest"}:
            continue
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


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--upload", action="store_true", help="connect and upload files")
    parser.add_argument("--tls", action="store_true", help="use explicit FTPS if supported")
    args = parser.parse_args()
    files = public_files(ROOT)
    print(f"Destination: {HOST}/{REMOTE}/")
    for path in files:
        print(f"  {path.relative_to(ROOT).as_posix()} ({path.stat().st_size} bytes)")
    print(f"{len(files)} files. Remote files will not be deleted.")
    if not args.upload:
        print("Preview only. Run with --upload to transfer these files.")
        return
    password = getpass.getpass(f"FTP password for {USER}: ")
    client_type = ftplib.FTP_TLS if args.tls else ftplib.FTP
    with client_type(timeout=30) as ftp:
        ftp.connect(HOST, 21)
        ftp.login(USER, password)
        if args.tls:
            ftp.prot_p()
        ftp.cwd(REMOTE)
        base = ftp.pwd()
        for path in files:
            relative = path.relative_to(ROOT)
            ftp.cwd(base)
            for part in relative.parts[:-1]:
                try:
                    ftp.cwd(part)
                except ftplib.error_perm:
                    ftp.mkd(part)
                    ftp.cwd(part)
            with path.open("rb") as source:
                ftp.storbinary(f"STOR {relative.name}", source)
            print(f"Uploaded: {relative.as_posix()}")


if __name__ == "__main__":
    main()
