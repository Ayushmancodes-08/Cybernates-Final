@echo off
title CYBERGUARD Autonomous SOC Platform Runner
color 0B
echo ===============================================================================
echo   CYBERGUARD — Odisha Knowledge Corporation Limited (OKCL) Hackathon
echo   Problem Statement 9: AI Cyber Threat, Phishing & Impersonation Defense
echo   Team: Cybernates (Team ID: BH26PS09T049)
echo ===============================================================================
echo.
echo Launching unified Python runner (FastAPI Backend + React Frontend)...
echo.

where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python was not found in your PATH!
    echo Please install Python 3.10+ from python.org and check "Add Python to PATH".
    pause
    exit /b 1
)

python run.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] Server session ended with code %ERRORLEVEL%.
    pause
)
