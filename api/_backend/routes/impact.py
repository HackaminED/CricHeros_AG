"""
impact.py — Leaderboard and impact-related routes.
"""

from fastapi import APIRouter, Query
from api._backend.database.db import query_all
from api._backend.services.impact_engine import (
    get_leaderboard_data, ALLOWED_TEAMS, MIN_INNINGS_LEADERBOARD,
)
from api._backend.services.cis_engine import get_cis_leaderboard, get_clutch_leaderboard

router = APIRouter(tags=["impact"])


@router.get("/leaderboard")
def get_leaderboard(
    min_innings: int = Query(10, ge=1, le=50, description="Minimum innings to qualify"),
    teams: str | None = Query(None, description="Comma-separated list of allowed teams"),
    role: str | None = Query(None, description="'batter' or 'bowler'"),
    limit: int = Query(50, ge=1, le=200),
    gender: str = "Men"
):
    """
    Get the top players sorted by recency-weighted 3-layer impact score.
    Supports filtering by minimum innings played, specific teams, and role.
    Strictly isolated by gender.
    """
    team_list = teams.split(",") if teams else ALLOWED_TEAMS
    
    # Filter to only allowed teams for security/consistency
    valid_teams = [t for t in team_list if t in ALLOWED_TEAMS]
    if not valid_teams:
        valid_teams = ALLOWED_TEAMS

    data = get_leaderboard_data(
        min_innings=min_innings,
        teams=valid_teams,
        role=role,
        top_k=limit,
        gender=gender
    )
    return {"leaderboard": data, "count": len(data)}


@router.get("/leaderboard/cis")
def get_leaderboard_cis(
    gender: str = "Men",
    min_innings: int = Query(10, ge=1, le=50),
    top_k: int = Query(100, ge=1, le=200),
):
    """Leaderboard sorted by CIS normalized (50 = replacement level)."""
    data = get_cis_leaderboard(gender=gender, min_innings=min_innings, top_k=top_k)
    return {"leaderboard": data, "count": len(data)}


@router.get("/leaderboard/clutch")
def get_leaderboard_clutch(
    gender: str = "Men",
    min_matches: int = Query(5, ge=1, le=50),
    top_k: int = Query(100, ge=1, le=200),
):
    """Leaderboard sorted by average match swing (Clutch Impact %)."""
    data = get_clutch_leaderboard(gender=gender, min_matches=min_matches, top_k=top_k)
    return {"leaderboard": data, "count": len(data)}


@router.get("/stats")
def get_global_stats():
    """Get global statistics (filtered to allowed teams)."""
    placeholders = ",".join("?" for _ in ALLOWED_TEAMS)

    total_players = query_all(
        f"SELECT COUNT(DISTINCT player) as count FROM player_scores WHERE team IN ({placeholders})",
        tuple(ALLOWED_TEAMS),
    )
    total_matches = query_all(
        f"SELECT COUNT(DISTINCT match_id) as count FROM player_match_impacts WHERE team IN ({placeholders})",
        tuple(ALLOWED_TEAMS),
    )
    avg_score = query_all(
        f"SELECT AVG(impact_score) as avg FROM player_scores WHERE team IN ({placeholders})",
        tuple(ALLOWED_TEAMS),
    )

    return {
        "total_players": total_players[0]["count"] if total_players else 0,
        "total_matches": total_matches[0]["count"] if total_matches else 0,
        "average_impact": round(avg_score[0]["avg"], 2) if avg_score and avg_score[0]["avg"] else 50,
    }
