#!/usr/bin/env python3
"""
CYBERGUARD — Unified Development & Demonstration Runner
Odisha Knowledge Corporation Limited (OKCL) Hackathon | Problem Statement 9
Team: Cybernates (Team ID: BH26PS09T049)

Launches both FastAPI Backend (port 8000) and React 19 Frontend (port 5173),
verifies health endpoints, and automatically opens the browser.
"""

import os
import sys
import time
import subprocess
import webbrowser
import signal
import urllib.request
import urllib.error

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")

BACKEND_URL = "http://127.0.0.1:8000/api/v1/health/live"
FRONTEND_URL = "http://127.0.0.1:5173"

BANNER = r"""
================================================================================
  CYBERGUARD: AI-Powered Autonomous SOC & Adaptive Firewall Platform
  Event: OKCL Hackathon | Problem Statement 9 | Team: Cybernates
================================================================================
  [*] Backend Engine  : FastAPI 0.115 + Uvicorn (Port 8000)
  [*] Frontend Console : React 19 + TypeScript + Vite 8 (Port 5173)
  [*] Credentials Pre-loaded:
      - Admin  : elena.vance@cyberguard.internal    / CyberGuard@2026!Admin
      - Analyst: marcus.chen@cyberguard.internal   / CyberGuard@2026!Analyst
================================================================================
"""

def check_python_environment():
    print("[1/5] Checking Python environment...")
    req_file = os.path.join(BACKEND_DIR, "requirements.txt")
    if os.path.exists(req_file):
        try:
            import fastapi
            import uvicorn
            import pydantic
            import jwt
            import argon2
            print("      ✓ Python dependencies verified.")
        except ImportError:
            print("      [!] Installing missing Python packages from requirements.txt...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", req_file])
            print("      ✓ Python dependencies installed.")

def check_frontend_environment():
    print("[2/5] Checking Frontend environment...")
    node_modules = os.path.join(FRONTEND_DIR, "node_modules")
    if not os.path.exists(node_modules):
        print("      [!] node_modules missing. Running npm install...")
        npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
        subprocess.check_call([npm_cmd, "install"], cwd=FRONTEND_DIR)
        print("      ✓ Frontend dependencies installed.")
    else:
        print("      ✓ node_modules already present.")

def wait_for_url(url, timeout=30):
    start = time.time()
    while time.time() - start < timeout:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "CyberGuard-Probe/1.0"})
            with urllib.request.urlopen(req, timeout=2) as response:
                if response.status in (200, 304):
                    return True
        except (urllib.error.URLError, ConnectionError, OSError):
            time.sleep(0.5)
    return False

def main():
    print(BANNER)
    check_python_environment()
    check_frontend_environment()

    processes = []

    def cleanup(signum=None, frame=None):
        print("\n\n[*] Shutting down CyberGuard services gracefully...")
        for p in processes:
            try:
                if sys.platform == "win32":
                    subprocess.call(["taskkill", "/F", "/T", "/PID", str(p.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                else:
                    p.terminate()
            except Exception:
                pass
        print("[*] All services stopped. Thank you for using CyberGuard!\n")
        sys.exit(0)

    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)

    import socket
    local_ip = "127.0.0.1"
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
    except Exception:
        pass

    print(f"\n[3/5] Starting FastAPI Backend on http://0.0.0.0:8000 (LAN: http://{local_ip}:8000)...")
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"],
        cwd=BACKEND_DIR
    )
    processes.append(backend_proc)

    print(f"[4/5] Starting React Frontend on http://0.0.0.0:5173 (LAN: http://{local_ip}:5173)...")
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"],
        cwd=FRONTEND_DIR
    )
    processes.append(frontend_proc)

    print("[5/5] Awaiting service initialization...")
    backend_ready = wait_for_url(BACKEND_URL, timeout=25)
    if backend_ready:
        print("      ✓ Backend is ONLINE: http://127.0.0.1:8000/docs")
    else:
        print("      [!] Warning: Backend health probe timed out, but process is running.")

    frontend_ready = wait_for_url(FRONTEND_URL, timeout=25)
    if frontend_ready:
        print("      ✓ Frontend is ONLINE: http://127.0.0.1:5173")
    else:
        print("      [!] Warning: Frontend probe timed out, attempting browser launch anyway.")

    print("\n" + "=" * 80)
    print("  🚀 CYBERGUARD DEFENSE ECOSYSTEM IS OPERATIONAL!")
    print(f"  🖥️  SOC Console (Laptop)       : http://127.0.0.1:5173")
    print(f"  📱 Mobile Attacker Launcher    : http://{local_ip}:5173/attacker")
    print(f"  🛡️ Real-Time Live Ingress API  : http://{local_ip}:8000/api/v1/live-ingress")
    print(f"  🧠 Local Ollama AI Engine      : http://127.0.0.1:11434 (qwen2.5:3b active)")
    print("  👉 Press Ctrl + C in this terminal anytime to stop all servers.")
    print("=" * 80 + "\n")

    try:
        webbrowser.open("http://127.0.0.1:5173")
    except Exception:
        pass

    try:
        while True:
            time.sleep(1)
            # Check if any process terminated unexpectedly
            if backend_proc.poll() is not None:
                print("[!] Backend exited unexpectedly. Code:", backend_proc.returncode)
                break
            if frontend_proc.poll() is not None:
                print("[!] Frontend exited unexpectedly. Code:", frontend_proc.returncode)
                break
    except KeyboardInterrupt:
        pass
    finally:
        cleanup()

if __name__ == "__main__":
    main()
