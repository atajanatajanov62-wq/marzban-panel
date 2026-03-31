#!/usr/bin/env python3
"""
Professional X Panel — Marzban Backend Patcher
================================================
Injects px_connections into an existing Marzban installation.

Usage:
    python3 apply_patch.py [--marzban-path /path/to/marzban] [--undo]

Auto-detects Marzban location if not specified.
"""

import sys
import os
import shutil
import argparse
import textwrap
from pathlib import Path
from datetime import datetime

BACKUP_SUFFIX = f".px-backup-{datetime.now().strftime('%Y%m%d-%H%M%S')}"

GREEN = "\033[92m"; YELLOW = "\033[93m"; RED = "\033[91m"; CYAN = "\033[96m"; NC = "\033[0m"
def ok(m):   print(f"{GREEN}[OK]{NC}   {m}")
def info(m): print(f"{CYAN}[INFO]{NC} {m}")
def warn(m): print(f"{YELLOW}[WARN]{NC} {m}")
def err(m):  print(f"{RED}[ERR]{NC}  {m}"); sys.exit(1)

# ── Locate Marzban ────────────────────────────────────────
def find_marzban() -> Path:
    candidates = [
        Path("/opt/marzban"),
        Path("/usr/local/lib").glob("python3.*/dist-packages"),
        Path("/usr/lib").glob("python3*/dist-packages"),
        Path("/root/marzban"),
        Path("/home/marzban"),
    ]
    # Flat list
    flat = []
    for c in candidates:
        if isinstance(c, Path):
            flat.append(c)
        else:
            flat.extend(c)

    for base in flat:
        main_py = base / "app" / "main.py"
        if main_py.exists():
            return base

    # Search filesystem
    info("Searching filesystem for Marzban (may take a moment)...")
    for root, dirs, files in os.walk("/"):
        dirs[:] = [d for d in dirs if d not in ("proc", "sys", "dev", "run", "snap")]
        if "main.py" in files:
            p = Path(root) / "main.py"
            try:
                content = p.read_text()
                if "marzban" in content.lower() and "fastapi" in content.lower():
                    return p.parent.parent
            except Exception:
                pass
    return None

# ── Patch main.py ─────────────────────────────────────────
MARKER_START = "# >>> px_connections START"
MARKER_END   = "# >>> px_connections END"

PATCH_IMPORT = textwrap.dedent("""\
    # >>> px_connections START
    try:
        from px_connections import router as px_router, PXConnectionMiddleware
        _px_enabled = True
    except ImportError:
        _px_enabled = False
    # >>> px_connections END
""")

PATCH_ROUTER = textwrap.dedent("""\
    # >>> px_connections START
    if _px_enabled:
        app.include_router(px_router)
        app.add_middleware(PXConnectionMiddleware)
    # >>> px_connections END
""")

def already_patched(text: str) -> bool:
    return MARKER_START in text

def apply_patch(main_py: Path, dry_run: bool = False) -> bool:
    text = main_py.read_text()
    if already_patched(text):
        warn("main.py already patched — skipping.")
        return True

    # Backup
    backup = Path(str(main_py) + BACKUP_SUFFIX)
    if not dry_run:
        shutil.copy2(main_py, backup)
        ok(f"Backed up main.py → {backup.name}")

    lines = text.splitlines(keepends=True)
    new_lines = []
    app_created_line = -1

    # Find where `app = FastAPI(...)` is defined (or `app: FastAPI`)
    for i, line in enumerate(lines):
        stripped = line.strip()
        if (stripped.startswith("app = FastAPI(") or
                stripped.startswith("app: FastAPI =") or
                "FastAPI(" in stripped and "app" in stripped):
            app_created_line = i
            break

    if app_created_line == -1:
        warn("Could not find 'app = FastAPI(...)' in main.py. Appending at end.")

    # Insert import block at the top (after last import statement)
    last_import = 0
    for i, line in enumerate(lines):
        if line.startswith("import ") or line.startswith("from "):
            last_import = i
    lines.insert(last_import + 1, "\n" + PATCH_IMPORT + "\n")

    # Re-find app_created_line (shifted by insert)
    new_text = "".join(lines)
    # Append router registration at end of file
    new_text += "\n" + PATCH_ROUTER + "\n"

    if dry_run:
        print("\n--- PATCH PREVIEW ---")
        print(new_text[:3000], "...[truncated]" if len(new_text) > 3000 else "")
        return True

    main_py.write_text(new_text)
    ok("main.py patched successfully.")
    return True

def undo_patch(main_py: Path) -> bool:
    # Find latest backup
    backups = sorted(main_py.parent.glob(f"{main_py.name}.px-backup-*"), reverse=True)
    if not backups:
        err("No backup found. Cannot undo.")
    latest = backups[0]
    shutil.copy2(latest, main_py)
    ok(f"Restored main.py from {latest.name}")
    return True

# ── Main ──────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Professional X Panel — Marzban Patcher")
    parser.add_argument("--marzban-path", default=None, help="Path to Marzban installation root")
    parser.add_argument("--undo", action="store_true", help="Restore original main.py from backup")
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without writing")
    args = parser.parse_args()

    print(f"\n{CYAN}{'='*50}")
    print("  Professional X Panel — Backend Patcher")
    print(f"{'='*50}{NC}\n")

    if args.marzban_path:
        marzban_root = Path(args.marzban_path)
    else:
        info("Auto-detecting Marzban installation...")
        marzban_root = find_marzban()

    if not marzban_root:
        err("Marzban not found. Pass --marzban-path /path/to/marzban")

    main_py = marzban_root / "app" / "main.py"
    app_dir = marzban_root / "app"

    if not main_py.exists():
        err(f"app/main.py not found at {main_py}")

    ok(f"Found Marzban at: {marzban_root}")

    if args.undo:
        undo_patch(main_py)
        return

    # Copy px_connections.py into Marzban's app directory
    src = Path(__file__).parent / "px_connections.py"
    dst = app_dir / "px_connections.py"

    if not args.dry_run:
        if not src.exists():
            err(f"px_connections.py not found at {src}")
        shutil.copy2(src, dst)
        ok(f"Copied px_connections.py → {dst}")

    # Patch main.py
    apply_patch(main_py, dry_run=args.dry_run)

    if not args.dry_run:
        print(f"\n{GREEN}{'='*50}")
        print("  Patch applied!")
        print(f"  Restart Marzban to activate:{NC}")
        print("    systemctl restart marzban")
        print("     — or —")
        print("    docker restart $(docker ps --format '{{.Names}}' | grep marzban)")
        print(f"{GREEN}{'='*50}{NC}\n")

if __name__ == "__main__":
    main()
