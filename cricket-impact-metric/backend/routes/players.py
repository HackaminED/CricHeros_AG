"""
players.py — Player-related API routes.
"""

from fastapi import APIRouter, HTTPException, Query
from backend.database.db import query_all, query_one
from backend.services.impact_engine import get_player_impact_data, ALLOWED_TEAMS
from backend.services.rolling_impact import get_player_rolling_trend, get_player_career_stats

router = APIRouter(prefix="/players", tags=["players"])


@router.get("")
def get_players(
    team: str | None = None,
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    gender: str = "Men"
):
    """
    List unique players, optionally filtered by team and gender.
    Ensures only players from ALLOWED_TEAMS are returned.
    """
    placeholders = ",".join("?" for _ in ALLOWED_TEAMS)
    query = f"""
        SELECT DISTINCT player, team, gender, impact_score
        FROM player_scores
        WHERE team IN ({placeholders}) AND gender = ?
    """
    params = [*ALLOWED_TEAMS, gender]

    if team:
        query += " AND team = ?"
        params.append(team)

    query += " ORDER BY player LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    rows = query_all(query, tuple(params))
    return {"players": rows, "count": len(rows)}


@router.get("/{name}/impact")
def get_player_impact(
    name: str,
    last_n: int = Query(10, ge=1, le=10, description="Number of recent innings"),
    gender: str = "Men"
):
    """Get 3-layer impact breakdown for a player (last N innings)."""
    data = get_player_impact_data(name, last_n=last_n, gender=gender)
    if not data:
        raise HTTPException(status_code=404, detail=f"Player '{name}' not found")

    career = get_player_career_stats(name)

    # Quick normalization: use the leaderboard context
    from backend.services.impact_engine import get_leaderboard_data
    lb = get_leaderboard_data(min_innings=1, top_k=9999, last_n=last_n, gender=gender)
    if lb:
        all_weighted = [p["impact_weighted"] for p in lb]
        mn, mx = min(all_weighted), max(all_weighted)
        spread = mx - mn if mx - mn > 1e-6 else 1.0
        norm = 100 * (data["impact_weighted"] - mn) / spread
        data["impact_normalized"] = round(max(0.0, min(100.0, norm)), 1)
    else:
        data["impact_normalized"] = 50.0

    from backend.services.impact_engine import _categorize
    data["category"] = _categorize(data["impact_normalized"])

    # Normalize per-innings scores too
    if data["last_n_innings"]:
        raw_vals = [d["raw_impact"] for d in data["last_n_innings"]]
        if lb:
            for d in data["last_n_innings"]:
                inn_norm = 100 * (d["raw_impact"] - mn) / spread
                d["impact_normalized_innings"] = round(max(0.0, min(100.0, inn_norm)), 1)
        else:
            for d in data["last_n_innings"]:
                d["impact_normalized_innings"] = 50.0

    return {
        "player": data["player_name"],
        "team": data["team"],
        "gender": data["gender"],
        "impact_score": data["impact_normalized"],
        "impact_weighted": data["impact_weighted"],
        "category": data["category"],
        "total_innings": data["total_innings"],
        "last_n_count": data["last_n_count"],
        "batting_impact_component": data["batting_impact_component"],
        "bowling_impact_component": data["bowling_impact_component"],
        "context_weight_avg": data["context_weight_avg"],
        "pressure_index_avg": data["pressure_index_avg"],
        "last_n_stats": data["last_n_stats"],
        "last_n_innings": data["last_n_innings"],
        "explain": data["explain"],
        "career": career,
        "latest_match": {
            "batting_impact": data["last_n_innings"][0]["wpa_batting"] if data["last_n_innings"] else 0,
            "bowling_impact": data["last_n_innings"][0]["wpa_bowling"] if data["last_n_innings"] else 0,
            "match_impact": (data["last_n_innings"][0]["wpa_batting"] + data["last_n_innings"][0]["wpa_bowling"]) if data["last_n_innings"] else 0,
            "runs_scored": data["last_n_innings"][0]["runs"] if data["last_n_innings"] else 0,
            "wickets_taken": data["last_n_innings"][0]["wickets"] if data["last_n_innings"] else 0,
        },
    }


@router.get("/{name}/trend")
def get_player_trend(
    name: str,
    window: int = Query(10, ge=1, le=50),
    last_n: int = Query(10, ge=1, le=10),
    gender: str = "Men"
):
    """Get rolling impact trend for a player (last N innings)."""
    row = query_one("SELECT player FROM player_scores WHERE player = ?", (name,))
    if not row:
        raise HTTPException(status_code=404, detail=f"Player '{name}' not found")

    trend = get_player_rolling_trend(name, window)

    # Enrich with 3-layer data if available
    data = get_player_impact_data(name, last_n=last_n, gender=gender)
    if data and data["last_n_innings"]:
        enriched = list(reversed(data["last_n_innings"]))  # chronological order
    else:
        enriched = None

    return {
        "player": name,
        "trend": trend,
        "trend_3layer": enriched,
        "count": len(trend),
    }
