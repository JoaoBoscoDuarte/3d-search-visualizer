from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.api.routes import router

ROOT = Path(__file__).resolve().parents[2]
FRONTEND_PUBLIC = ROOT / "frontend" / "public"

app = FastAPI(title="3D Search Visualizer", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

if FRONTEND_PUBLIC.is_dir():
    app.mount("/", StaticFiles(directory=FRONTEND_PUBLIC, html=True), name="frontend")
