import JSZip from 'jszip';

export const LOCAL_PROJECT_FILES = {
  requirementsTxt: `# Windows 7 Compatible (Python 3.8.10 x64)
fastapi==0.95.2
uvicorn[standard]==0.22.0
python-multipart==0.0.6
Pillow==9.5.0
rembg==2.0.38
onnxruntime==1.14.1
numpy==1.24.4
`,
  mainPy: `"""
AI Product Image Background Remover - Phase 1 MVP
Windows 7 Compatible (Python 3.8.10 + FastAPI + U2-Net / rembg + Pillow)
100% Free Open-Source Pretrained AI Model - No Paid APIs - No Database
"""
import io
import os
import sys
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import uvicorn
from rembg import remove, new_session

app = FastAPI(
    title="AI Product Image Background Remover",
    description="Windows 7 compatible local background remover using open-source U2-Net AI model"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_NAME = os.environ.get("BG_MODEL", "u2net")

print("=" * 60)
print(f" Initializing AI Background Remover (Model: {MODEL_NAME})")
print(" Open-source pretrained neural network via ONNX Runtime")
print("=" * 60)

try:
    session = new_session(MODEL_NAME)
    print(f" Model '{MODEL_NAME}' successfully loaded into memory!")
except Exception as e:
    print(f"Note: Session will initialize on first image request ({e})")
    session = None


@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "model": MODEL_NAME,
        "python_version": sys.version.split()[0],
        "os": sys.platform
    }


@app.post("/api/remove-background")
async def remove_background(file: UploadFile = File(...)):
    """
    Takes an input image (JPG, JPEG, PNG, WebP) and returns
    a transparent PNG with the background removed.
    """
    filename = file.filename or "image.png"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format '{ext}'. Allowed: JPG, JPEG, PNG, WebP."
        )

    try:
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        pil_img = Image.open(io.BytesIO(image_bytes))
        if pil_img.mode not in ("RGB", "RGBA"):
            pil_img = pil_img.convert("RGB")

        global session
        if session is None:
            session = new_session(MODEL_NAME)
            
        result_img = remove(pil_img, session=session)

        output_buffer = io.BytesIO()
        result_img.save(output_buffer, format="PNG", optimize=True)
        output_buffer.seek(0)

        stem = os.path.splitext(filename)[0]
        return Response(
            content=output_buffer.getvalue(),
            media_type="image/png",
            headers={
                "Content-Disposition": f'attachment; filename="transparent_{stem}.png"'
            }
        )

    except Exception as exc:
        print(f"Error processing {filename}: {exc}")
        raise HTTPException(status_code=500, detail=f"AI background removal failed: {str(exc)}")


static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")


if __name__ == "__main__":
    print("\\n Server running! Open in your browser: http://127.0.0.1:8000")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
`,
  runBat: `@echo off
title AI Product Image Background Remover (Windows 7)
color 0b
echo ================================================================
echo   AI Product Image Background Remover - Phase 1 MVP
echo   Windows 7 + Python 3.8.10 + U2-Net Pretrained AI Model
echo ================================================================
echo.

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

if not exist "venv\\Scripts\\activate.bat" (
    echo [1/3] Creating Python virtual environment (venv)...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
)

call venv\\Scripts\\activate.bat

if not exist "venv\\.installed" (
    echo [2/3] Installing Windows 7 compatible packages (FastAPI, rembg, Pillow)...
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo [ERROR] Dependency installation failed.
        pause
        exit /b 1
    )
    echo dependencies_installed > venv\\.installed
    echo [SUCCESS] Dependencies installed!
) else (
    echo [2/3] Dependencies already installed.
)

echo.
echo [3/3] Starting local FastAPI server with open-source AI model...
echo Open your browser at: http://127.0.0.1:8000
echo.

start http://127.0.0.1:8000
python main.py

pause
`,
  staticHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Product Image Background Remover - Phase 1 MVP</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
    body { background: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 32px 16px; }
    .container { width: 100%; max-width: 960px; }
    header { text-align: center; margin-bottom: 28px; }
    .badge { display: inline-block; padding: 4px 12px; background: #065f46; color: #6ee7b7; font-size: 12px; font-weight: 600; border-radius: 9999px; margin-bottom: 8px; }
    h1 { font-size: 26px; font-weight: 700; color: #ffffff; margin-bottom: 6px; }
    p.sub { color: #94a3b8; font-size: 14px; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.3); }
    .dropzone { border: 2px dashed #475569; border-radius: 8px; padding: 36px 16px; text-align: center; cursor: pointer; transition: 0.2s; background: rgba(15,23,42,0.4); }
    .dropzone:hover { border-color: #3b82f6; background: rgba(59,130,246,0.06); }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 11px 22px; background: #2563eb; color: #fff; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; transition: 0.15s; }
    .btn:hover:not(:disabled) { background: #1d4ed8; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-download { background: #059669; }
    .btn-download:hover:not(:disabled) { background: #047857; }
    .btn-secondary { background: #334155; }
    .btn-secondary:hover { background: #475569; }
    .preview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px; }
    @media (max-width: 640px) { .preview-grid { grid-template-columns: 1fr; } }
    .preview-box { background: #0b1120; border: 1px solid #334155; border-radius: 8px; padding: 14px; text-align: center; }
    .preview-box h3 { font-size: 12px; text-transform: uppercase; color: #94a3b8; margin-bottom: 10px; letter-spacing: 0.05em; }
    .img-wrap { width: 100%; height: 260px; display: flex; align-items: center; justify-content: center; border-radius: 6px; overflow: hidden; }
    .img-wrap img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .checkerboard {
      background-color: #e2e8f0;
      background-image: linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%);
      background-size: 16px 16px;
      background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
    }
    .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: #fff; animation: spin 0.8s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="badge">Windows 7 Compatible &bull; 100% Free &bull; U&sup2;-Net</div>
      <h1>AI Product Image Background Remover</h1>
      <p class="sub">FastAPI + Pillow + U&sup2;-Net AI Model. Completely free local MVP.</p>
    </header>

    <div class="card">
      <div class="dropzone" id="dropzone" onclick="document.getElementById('fileInput').click()">
        <p style="font-size: 16px; font-weight: 500; color: #e2e8f0; margin-bottom: 4px;">Click to browse or drag and drop image here</p>
        <p style="font-size: 12px; color: #64748b;">Supports JPG, JPEG, PNG, WebP</p>
      </div>
      <input type="file" id="fileInput" accept="image/jpeg,image/png,image/webp" style="display: none;" />

      <div style="display: flex; gap: 10px; margin-top: 16px;">
        <button class="btn" id="removeBtn" disabled onclick="removeBackground()">Remove Background</button>
        <button class="btn btn-secondary" id="resetBtn" style="display: none;" onclick="resetAll()">Select Another</button>
      </div>

      <div id="statusArea" style="display: none; align-items: center; gap: 8px; margin-top: 14px; font-size: 14px; color: #38bdf8;">
        <span class="spinner"></span>
        <span id="statusText">Processing with U&sup2;-Net model...</span>
      </div>
    </div>

    <div class="card" id="resultCard" style="display: none;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
        <h2 style="font-size: 16px; font-weight: 600;">Result Comparison</h2>
        <button class="btn btn-download" onclick="downloadImage()">Download Transparent PNG</button>
      </div>
      <div class="preview-grid">
        <div class="preview-box">
          <h3>Original</h3>
          <div class="img-wrap"><img id="origImg" /></div>
        </div>
        <div class="preview-box">
          <h3>Transparent Result</h3>
          <div class="img-wrap checkerboard"><img id="resultImg" /></div>
        </div>
      </div>
    </div>
  </div>

  <script>
    let currentFile = null;
    let resultBlobUrl = null;
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const removeBtn = document.getElementById('removeBtn');
    const resetBtn = document.getElementById('resetBtn');
    const statusArea = document.getElementById('statusArea');
    const resultCard = document.getElementById('resultCard');
    const origImg = document.getElementById('origImg');
    const resultImg = document.getElementById('resultImg');

    ['dragover', 'dragenter'].forEach(e => dropzone.addEventListener(e, ev => { ev.preventDefault(); dropzone.style.borderColor = '#3b82f6'; }));
    ['dragleave', 'drop'].forEach(e => dropzone.addEventListener(e, ev => { ev.preventDefault(); dropzone.style.borderColor = '#475569'; }));
    dropzone.addEventListener('drop', e => { if (e.dataTransfer.files[0]) selectFile(e.dataTransfer.files[0]); });
    fileInput.addEventListener('change', e => { if (e.target.files[0]) selectFile(e.target.files[0]); });

    function selectFile(f) {
      currentFile = f;
      origImg.src = URL.createObjectURL(f);
      removeBtn.disabled = false;
      resetBtn.style.display = 'inline-flex';
      resultCard.style.display = 'none';
      if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
    }

    async function removeBackground() {
      if (!currentFile) return;
      removeBtn.disabled = true;
      statusArea.style.display = 'flex';
      const fd = new FormData();
      fd.append('file', currentFile);
      try {
        const res = await fetch('/api/remove-background', { method: 'POST', body: fd });
        if (!res.ok) throw new Error(await res.text());
        const blob = await res.blob();
        resultBlobUrl = URL.createObjectURL(blob);
        resultImg.src = resultBlobUrl;
        resultCard.style.display = 'block';
      } catch (err) {
        alert('Error: ' + err.message);
      } finally {
        removeBtn.disabled = false;
        statusArea.style.display = 'none';
      }
    }

    function downloadImage() {
      if (!resultBlobUrl) return;
      const a = document.createElement('a');
      a.href = resultBlobUrl;
      a.download = (currentFile ? currentFile.name.replace(/\\.[^/.]+$/, '') : 'result') + '_transparent.png';
      a.click();
    }

    function resetAll() {
      currentFile = null;
      fileInput.value = '';
      removeBtn.disabled = true;
      resetBtn.style.display = 'none';
      resultCard.style.display = 'none';
      if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
    }
  </script>
</body>
</html>
`,
  readmeMd: `# AI Product Image Background Remover (Windows 7 Compatible)

### 1. Requirements for Windows 7:
- Windows 7 64-bit with Service Pack 1 (SP1)
- Python 3.8.10 (64-bit) (https://www.python.org/ftp/python/3.8.10/python-3.8.10-amd64.exe)
  * Note: Check "Add Python 3.8 to PATH" during installation.
- Python 3.9+ dropped Windows 7 support.
- RMBG-2.0 is NOT practical on Windows 7 due to PyTorch 2.x and CUDA 12 requirements.
- We use U2-Net via ONNX Runtime CPU which runs smoothly on Windows 7.

### 2. How to Run:
- Double click 'run.bat'
- Or run in Command Prompt:
    python -m venv venv
    venv\\Scripts\\activate.bat
    pip install -r requirements.txt
    python main.py
- Open http://127.0.0.1:8000 in your browser.
`
};

export async function downloadProjectZip(): Promise<void> {
  const zip = new JSZip();
  zip.file('main.py', LOCAL_PROJECT_FILES.mainPy);
  zip.file('requirements.txt', LOCAL_PROJECT_FILES.requirementsTxt);
  zip.file('run.bat', LOCAL_PROJECT_FILES.runBat);
  zip.file('README.md', LOCAL_PROJECT_FILES.readmeMd);
  
  const staticFolder = zip.folder('static');
  if (staticFolder) {
    staticFolder.file('index.html', LOCAL_PROJECT_FILES.staticHtml);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ai-bg-remover-windows7.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
