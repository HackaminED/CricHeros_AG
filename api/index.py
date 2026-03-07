import sys
import os

# Add root directory to python path so 'backend' is visible
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import players, impact, matches

# Vercel's @vercel/python requires EXPLICIT instantiation of FastAPI() the entrypoint file.
app = FastAPI(
    title="Cricket Impact Metric API (Vercel Serverless)",
    description="Player impact scores based on win probability deltas",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes under /api prefix for Vercel Cloud Serverless compatibility
app.include_router(players.router, prefix="/api")
app.include_router(impact.router, prefix="/api")
app.include_router(matches.router, prefix="/api")

@app.get("/api")
def root():
    return {
        "name": "Cricket Impact Metric API",
        "version": "1.0.0",
        "status": "Serverless Active"
    }

# Ensure models and DB references point to absolute paths since vercel lambda runtime runs in /var/task
