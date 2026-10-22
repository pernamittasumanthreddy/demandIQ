"""
DemandIQ One-Click Application Runner
Starts both the Django REST Backend (port 8000) and Vite Frontend (port 3000).
"""

import os
import sys
import subprocess
import time
import webbrowser
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
PYTHON_EXE = ROOT_DIR / "venv" / "Scripts" / "python.exe"
if not PYTHON_EXE.exists():
    PYTHON_EXE = Path(sys.executable)

def main():
    print("=" * 60)
    print("  DemandIQ — Know What Sells. Stock What Matters.")
    print("=" * 60)
    print("Starting backend and frontend services...\n")

    # 1. Start Django Backend Server
    backend_cmd = [str(PYTHON_EXE), "manage.py", "runserver", "127.0.0.1:8000"]
    backend_proc = subprocess.Popen(
        backend_cmd,
        cwd=str(ROOT_DIR / "backend"),
        shell=False
    )
    print("✓ Django Backend starting at http://127.0.0.1:8000")

    # 2. Start Vite Frontend Server
    frontend_cmd = ["npm.cmd" if os.name == "nt" else "npm", "run", "dev"]
    frontend_proc = subprocess.Popen(
        frontend_cmd,
        cwd=str(ROOT_DIR / "frontend"),
        shell=True
    )
    print("✓ Vite Frontend starting at http://localhost:3000")
    print("\nDemandIQ is running! Press Ctrl+C in this terminal to shut down both servers.\n")

    time.sleep(2)
    webbrowser.open("http://localhost:3000")

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nStopping DemandIQ services...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Done.")

if __name__ == "__main__":
    main()
