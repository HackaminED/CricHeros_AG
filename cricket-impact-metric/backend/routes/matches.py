"""
matches.py — Match-related API routes.
"""

from fastapi import APIRouter, HTTPException, Query
from backend.database.db import query_all

router = APIRouter(prefix="/matches", tags=["matches"])


@router.get("/{match_id}")
def get_match(match_id: str):
    """Get match details with per-player impact breakdown."""
    rows = query_all(
        """
        SELECT player, team, batting_impact, bowling_impact,
               match_impact, impact_score, runs_scored, balls_faced,
               wickets_taken, balls_bowled, runs_conceded, start_date
        FROM player_match_impacts
        WHERE match_id = ?
        ORDER BY match_impact DESC
        """,
        (match_id,),
    )

    if not rows:
        raise HTTPException(status_code=404, detail=f"Match '{match_id}' not found")

    teams = {}
    for row in rows:
        team = row["team"]
        if team not in teams:
            teams[team] = []
        teams[team].append(row)

    return {
        "match_id": match_id,
        "date": rows[0]["start_date"] if rows else None,
        "teams": teams,
        "players": rows,
    }


@router.get("")
def list_matches(limit: int = Query(50, ge=1, le=500)):
    """List recent matches."""
    rows = query_all(
        """
        SELECT DISTINCT match_id, start_date, team
        FROM player_match_impacts
        ORDER BY start_date DESC
        """,
    )

    # Group by match
    matches = {}
    for row in rows:
        mid = row["match_id"]
        if mid not in matches:
            matches[mid] = {"match_id": mid, "date": row["start_date"], "teams": []}
        if row["team"] not in matches[mid]["teams"]:
            matches[mid]["teams"].append(row["team"])

    match_list = sorted(matches.values(), key=lambda x: x["date"] or "", reverse=True)[:limit]

    return {"matches": match_list, "count": len(match_list)}
