@echo off
title AI Product Image Background Remover (Windows 7)
color 0b
echo ================================================================
echo   AI Product Image Background Remover - Phase 1 MVP
echo   Windows 7 + Python 3.8.10 + U2-Net Pretrained AI Model
echo ================================================================
echo.

:: Check for Python
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found in PATH!
    echo Please install Python 3.8.10 (64-bit) for Windows 7 from:
    echo https://www.python.org/ftp/python/3.8.10/python-3.8.10-amd64.exe
    echo Make sure to check "Add Python 3.8 to PATH" during installation.
    echo.
    pause
    exit /b 1
)

:: Create Virtual Environment if it doesn't exist
if not exist "venv\Scripts\activate.bat" (
    echo [1/3] Creating Python virtual environment (venv)...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
)

:: Activate virtual environment
call venv\Scripts\activate.bat

:: Install dependencies if flag file does not exist
if not exist "venv\.installed" (
    echo [2/3] Installing Windows 7 compatible packages (FastAPI, rembg, Pillow)...
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo [ERROR] Dependency installation failed.
        pause
        exit /b 1
    )
    echo dependencies_installed > venv\.installed
    echo [SUCCESS] Dependencies installed!
) else (
    echo [2/3] Dependencies already installed.
)

echo.
echo [3/3] Starting local FastAPI server with open-source AI model...
echo Open your browser at: http://127.0.0.1:8000
echo.

:: Open browser automatically
start http://127.0.0.1:8000

:: Run FastAPI server
python main.py

pause
