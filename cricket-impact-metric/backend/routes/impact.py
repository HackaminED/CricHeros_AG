"""
impact.py — Leaderboard and impact-related routes.
"""

from fastapi import APIRouter, Query
from backend.database.db import query_all

router = APIRouter(tags=["impact"])


@router.get("/leaderboard")
def get_leaderboard(
    limit: int = Query(50, ge=1, le=200),
    role: str = Query(None, description="Filter by role: batter, bowler, allrounder"),
):
    """Get top players by impact score."""
    if role == "batter":
        rows = query_all(
            """
            SELECT player, team, impact_score,
                   batting_impact, bowling_impact,
                   runs_scored, wickets_taken
            FROM player_scores
            WHERE batting_impact > bowling_impact
            ORDER BY impact_score DESC
            LIMIT ?
            """,
            (limit,),
        )
    elif role == "bowler":
        rows = query_all(
            """
            SELECT player, team, impact_score,
                   batting_impact, bowling_impact,
                   runs_scored, wickets_taken
            FROM player_scores
            WHERE bowling_impact >= batting_impact
            ORDER BY impact_score DESC
            LIMIT ?
            """,
            (limit,),
        )
    else:
        rows = query_all(
            """
            SELECT player, team, impact_score,
                   batting_impact, bowling_impact,
                   runs_scored, wickets_taken
            FROM player_scores
            ORDER BY impact_score DESC
            LIMIT ?
            """,
            (limit,),
        )

    return {"leaderboard": rows, "count": len(rows)}


@router.get("/stats")
def get_global_stats():
    """Get global statistics."""
    total_players = query_all("SELECT COUNT(DISTINCT player) as count FROM player_scores")
    total_matches = query_all("SELECT COUNT(DISTINCT match_id) as count FROM player_match_impacts")
    avg_score = query_all("SELECT AVG(impact_score) as avg FROM player_scores")

    return {
        "total_players": total_players[0]["count"] if total_players else 0,
        "total_matches": total_matches[0]["count"] if total_matches else 0,
        "average_impact": round(avg_score[0]["avg"], 2) if avg_score and avg_score[0]["avg"] else 50,
    }
