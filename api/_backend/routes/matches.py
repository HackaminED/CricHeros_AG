"""
matches.py — Match-related API routes.
"""

from fastapi import APIRouter, HTTPException, Query
from api._backend.database.db import query_all
from api._backend.services.impact_engine import get_match_impact_data, ALLOWED_TEAMS
from api._backend.services.wpa_service import get_match_wpa
from api._backend.services.prediction_service import get_match_prediction, get_match_prediction_options
from pydantic import BaseModel

router = APIRouter(prefix="/matches", tags=["matches"])

class MatchPredictionRequest(BaseModel):
    team1: str
    team2: str
    venue: str
    toss_winner: str
    toss_decision: str
    gender: str = "Men"

@router.post("/predict")
def predict_match(req: MatchPredictionRequest):
    """Predicts win probability for team1 vs team2 based on venue and toss conditions."""
    return get_match_prediction(
        req.team1, req.team2, req.venue, req.toss_winner, req.toss_decision, req.gender
    )

@router.get("/predict/options")
def match_prediction_options():
    """Returns available dropdown options required for the match predictor."""
    return get_match_prediction_options()


@router.get("/{match_id}/wpa")
def get_match_wpa_route(
    match_id: str,
    gender: str = "Men",
):
    """Get per-ball WP timeline and per-player swing aggregates for a match."""
    data = get_match_wpa(match_id, gender=gender)
    if not data:
        raise HTTPException(status_code=404, detail=f"Match '{match_id}' not found or no WPA data")
    return data


@router.get("/{match_id}")
def get_match(match_id: str):
    """Get match details with per-player 3-layer impact breakdown."""
    data = get_match_impact_data(match_id)
    if not data:
        raise HTTPException(status_code=404, detail=f"Match '{match_id}' not found")
    return data


@router.get("")
def list_matches(
    team: str | None = None,
    limit: int = 50,
    offset: int = 0,
    gender: str = "Men"
):
    """
    List unique matches (teams and dates).
    Only returns matches where BOTH teams are in ALLOWED_TEAMS.
    Strictly isolates matches by gender format.
    """
    placeholders = ",".join("?" for _ in ALLOWED_TEAMS)
    
    query = f"""
        SELECT DISTINCT match_id, start_date, team
        FROM player_match_impacts
        WHERE team IN ({placeholders}) AND gender = ?
    """
    params = [*ALLOWED_TEAMS, gender]
    
    if team:
        query += " AND team = ?"
        params.append(team)

    query += " ORDER BY start_date DESC"
    
    rows = query_all(query, tuple(params))

    # Group by match — only include matches where BOTH teams are in allowed list
    matches = {}
    for row in rows:
        mid = row["match_id"]
        if mid not in matches:
            matches[mid] = {"match_id": mid, "date": row["start_date"], "teams": []}
        if row["team"] not in matches[mid]["teams"]:
            matches[mid]["teams"].append(row["team"])

    # Filter: keep only matches with at least 2 allowed teams
    filtered = [
        m for m in matches.values()
        if len(m["teams"]) >= 2
    ]

    match_list = sorted(filtered, key=lambda x: x["date"] or "", reverse=True)[:limit]
    return {"matches": match_list, "count": len(match_list)}
