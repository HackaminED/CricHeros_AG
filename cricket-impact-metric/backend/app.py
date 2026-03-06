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

# Register routes
app.include_router(players.router)
app.include_router(impact.router)
app.include_router(matches.router)


@app.get("/")
def root():
    return {
        "name": "Cricket Impact Metric API",
        "version": "1.0.0",
        "endpoints": [
            "GET /players",
            "GET /players/{name}/impact",
            "GET /players/{name}/trend",
            "GET /matches",
            "GET /matches/{match_id}",
            "GET /leaderboard",
            "GET /stats",
        ],
    }
