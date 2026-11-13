@echo off
title CyberGuard FastAPI Backend (Port 8000)
cd /d "%~dp0..\backend"
echo Starting CyberGuard FastAPI Backend on http://127.0.0.1:8000 ...
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
pause
