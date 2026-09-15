# AI Product Image Background Remover - Phase 1 MVP (Windows 7 Compatible)

A 100% free, local AI-powered background remover designed specifically for **Windows 7** compatibility. Uses open-source pretrained deep learning models (**U²-Net** via ONNX Runtime & Pillow) with a **FastAPI** backend and responsive web frontend.

---

## 1. Windows 7 Compatibility Guide & Model Choice

### Why Not Python 3.9+ or Python 3.12?
- **Python 3.8.10** is the **last official release of Python supporting Windows 7**.
- Python 3.9 dropped Windows 7 support; installers refuse to run, and the binaries fail due to missing kernel APIs (such as `api-ms-win-core-path-l1-1-0.dll`).
- **Required Windows 7 Update**: Windows 7 SP1 (Service Pack 1) with **KB2533623** or **KB3063858** installed to enable standard DLL path loading.

### Why RMBG-2.0 is NOT Practical on Windows 7:
- **RMBG-2.0** requires `transformers >= 4.40`, `torch >= 2.2`, and `python >= 3.10`.
- Modern PyTorch 2.x dropped Windows 7 support (crashes due to missing Windows 10 Universal CRT symbols).
- RMBG-2.0 weights are several gigabytes and require modern CUDA 12 drivers (Windows 7 GPU drivers ended at CUDA 10/11).

### The Most Reliable Open-Source Alternative: U²-Net via ONNX Runtime
- **Model**: **U²-Net** (176MB) or **U²-Netp** (4.7MB lightweight)
- **Engine**: `onnxruntime==1.14.1` (CPU execution provider)
- Runs completely on standard CPUs without GPU or CUDA requirements.
- Pre-built binary wheels exist for Python 3.8 x64 on Windows 7.
- Delivers clean alpha mattes and crisp product boundaries for e-commerce items (shoes, bottles, electronics, apparel, furniture).

---

## 2. Complete Folder Structure

```text
bg-remover-mvp/
├── main.py                # FastAPI server + Pillow + U2-Net / rembg inference
├── requirements.txt       # Exact pinned Windows 7 compatible packages
├── run.bat                # 1-click launch script (creates venv & runs server)
├── README.md              # Documentation and manual setup instructions
└── static/
    └── index.html         # SaaS UI (Upload, Before/After, Checkerboard, Download)
```

---

## 3. Quick Start (Windows 7)

### Prerequisites:
1. Download & install **Python 3.8.10 (64-bit)**:
   [https://www.python.org/ftp/python/3.8.10/python-3.8.10-amd64.exe](https://www.python.org/ftp/python/3.8.10/python-3.8.10-amd64.exe)
   *(IMPORTANT: Check the box **"Add Python 3.8 to PATH"** in the installer)*

### Option A: 1-Click Launch
Double-click `run.bat`. It will automatically:
1. Create a clean virtual environment (`venv`).
2. Install all pinned dependencies from `requirements.txt`.
3. Launch the FastAPI server at `http://127.0.0.1:8000`.
4. Open your default web browser to the application!

### Option B: Manual Command Line Instructions
Open `cmd.exe` in the project folder:

```cmd
:: 1. Create virtual environment
python -m venv venv

:: 2. Activate virtual environment
venv\Scripts\activate.bat

:: 3. Upgrade pip & install requirements
python -m pip install --upgrade pip
pip install -r requirements.txt

:: 4. Run the server
python main.py
```

Then visit **`http://127.0.0.1:8000`** in your browser.

---

## 4. API Endpoints

- `POST /api/remove-background`
  - Accepts: `multipart/form-data` with `file` (JPG, JPEG, PNG, WebP)
  - Returns: `image/png` with alpha transparency
- `GET /api/health`
  - Returns system and model status JSON
