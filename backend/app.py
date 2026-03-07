"""
app.py — FastAPI application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import players, impact, matches

app = FastAPI(
    title="Cricket Impact Metric API",
    description="Player impact scores based on win probability deltas",
    version="1.0.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes under /api prefix for Vercel Serverless compatibility
app.include_router(players.router, prefix="/api")
app.include_router(impact.router, prefix="/api")
app.include_router(matches.router, prefix="/api")

@app.get("/api")
def root():
    return {
        "name": "Cricket Impact Metric API",
        "version": "1.0.0",
        "endpoints": [
            "GET /players",
            "GET /players/{name}/impact",
            "GET /players/{name}/trend",
            "GET /players/{name}/wpa",
            "GET /players/{name}/cis",
            "GET /players/{name}/predict?opponent=...",
            "GET /players/{name}/predict/history",
            "GET /players/{name}/predict/matchup?role=...&against_type=...",
            "GET /players/predict/matchup-types",
            "GET /matches",
            "GET /matches/{match_id}",
            "GET /matches/{match_id}/wpa",
            "GET /leaderboard",
            "GET /leaderboard/cis",
            "GET /leaderboard/clutch",
            "GET /stats",
        ],
    }
