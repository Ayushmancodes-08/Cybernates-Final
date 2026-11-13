@echo off
title CyberGuard React Frontend (Port 5173)
cd /d "%~dp0..\frontend"
echo Starting CyberGuard Vite Frontend on http://127.0.0.1:5173 ...
npm run dev -- --host 127.0.0.1 --port 5173
pause
