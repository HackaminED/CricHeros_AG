"""
players.py — Player-related API routes.
"""

from fastapi import APIRouter, HTTPException, Query
from backend.database.db import query_all, query_one
from backend.services.rolling_impact import get_player_rolling_trend, get_player_career_stats

router = APIRouter(prefix="/players", tags=["players"])


@router.get("")
def list_players(
    search: str = Query(None, description="Search by player name"),
    limit: int = Query(100, ge=1, le=500),
):
    """List all players, optionally filtered by name search."""
    if search:
        rows = query_all(
            """
            SELECT DISTINCT player, team, impact_score
            FROM player_scores
            WHERE player LIKE ?
            ORDER BY impact_score DESC
            LIMIT ?
            """,
            (f"%{search}%", limit),
        )
    else:
        rows = query_all(
            """
            SELECT player, team, impact_score
            FROM player_scores
            ORDER BY impact_score DESC
            LIMIT ?
            """,
            (limit,),
        )
    return {"players": rows, "count": len(rows)}


@router.get("/{name}/impact")
def get_player_impact(name: str):
    """Get current impact score for a player."""
    row = query_one(
        """
        SELECT player, team, impact_score, rolling_impact,
               batting_impact, bowling_impact, match_impact,
               runs_scored, balls_faced, wickets_taken,
               balls_bowled, runs_conceded
        FROM player_scores
        WHERE player = ?
        """,
        (name,),
    )
    if not row:
        raise HTTPException(status_code=404, detail=f"Player '{name}' not found")

    career = get_player_career_stats(name)

    return {
        "player": row["player"],
        "team": row["team"],
        "impact_score": row["impact_score"],
        "latest_match": {
            "batting_impact": row["batting_impact"],
            "bowling_impact": row["bowling_impact"],
            "match_impact": row["match_impact"],
            "runs_scored": row["runs_scored"],
            "wickets_taken": row["wickets_taken"],
        },
        "career": career,
    }


@router.get("/{name}/trend")
def get_player_trend(name: str, window: int = Query(10, ge=1, le=50)):
    """Get rolling impact trend for a player (last N innings)."""
    # Verify player exists
    row = query_one("SELECT player FROM player_scores WHERE player = ?", (name,))
    if not row:
        raise HTTPException(status_code=404, detail=f"Player '{name}' not found")

    trend = get_player_rolling_trend(name, window)
    return {"player": name, "trend": trend, "count": len(trend)}
