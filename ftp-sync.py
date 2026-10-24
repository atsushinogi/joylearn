#!/usr/bin/env python3
"""Preview or upload website files. Remote files are never deleted."""
import argparse
import ftplib
import getpass
from pathlib import Path

ROOT = Path(__file__).resolve().parent
HOST = "netftp.asahi-net.or.jp"
USER = "fk5a-ng"
REMOTE = "homepage"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--upload", action="store_true", help="connect and upload files")
    parser.add_argument("--tls", action="store_true", help="use explicit FTPS if supported")
    args = parser.parse_args()
    files = sorted(
        p for p in ROOT.rglob("*")
        if p.is_file() and not p.is_symlink()
        and not any(part.startswith(".") or part == "__pycache__"
                    for part in p.relative_to(ROOT).parts)
        and p.name not in {"ftp-sync.py", "FTP-SYNC.md", "AGENTS.md"}
        and not p.name.endswith((".pem", ".key", ".p12", ".pfx"))
    )
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
