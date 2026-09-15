"""
AI Product Image Background Remover - Phase 1 MVP
Windows 7 Compatible (Python 3.8.10 + FastAPI + U2-Net / rembg + Pillow)
100% Free Open-Source Pretrained AI Model - No Paid APIs - No Database
"""
import io
import os
import sys
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import Response, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import uvicorn
from rembg import remove, new_session

app = FastAPI(
    title="AI Product Image Background Remover",
    description="Windows 7 compatible local background remover using open-source U2-Net AI model"
)

# Enable CORS so any frontend port or tool can communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Open-source model selection:
# 'u2net' is the gold standard salient object detection model (high fidelity, 176MB)
# 'u2netp' is the lightweight fast version (4.7MB, ideal for low-spec dual-core CPUs)
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
    # 1. Validate file extension and MIME
    filename = file.filename or "image.png"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image format '{ext}'. Supported: JPG, JPEG, PNG, WebP."
        )

    try:
        # 2. Read image bytes
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        # 3. Open with Pillow and convert to RGB/RGBA
        pil_img = Image.open(io.BytesIO(image_bytes))
        if pil_img.mode not in ("RGB", "RGBA"):
            pil_img = pil_img.convert("RGB")

        # 4. Remove background using open-source U2-Net model
        global session
        if session is None:
            session = new_session(MODEL_NAME)
            
        result_img = remove(pil_img, session=session)

        # 5. Save transparent PNG to memory buffer
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


# Serve static HTML/CSS/JS frontend
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")


if __name__ == "__main__":
    print("\n Server running! Open in your browser: http://127.0.0.1:8000")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
