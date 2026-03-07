"""
players.py — Player-related API routes.
"""

from fastapi import APIRouter, HTTPException, Query
from backend.database.db import query_all, query_one
from backend.services.impact_engine import get_player_impact_data, ALLOWED_TEAMS
from backend.services.rolling_impact import get_player_rolling_trend, get_player_career_stats
from backend.services.wpa_service import get_player_wpa
from backend.services.cis_engine import get_player_cis
from backend.services.prediction_service import (
    predict_impact_vs_opponent,
    predict_impact_vs_opponent_at_venue,
    predict_matchup,
    get_player_innings_with_opponent,
    get_available_matchup_types,
)

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

@router.get("/search")
def search_players(
    q: str = Query(..., min_length=1),
    gender: str = "Men"
):
    """
    Search players by name with case-insensitive substring matching.
    Results are ranked: exact prefix match first, then word match, then substring match.
    """
    query = """
        SELECT DISTINCT player, team, gender, impact_score
        FROM player_scores
        WHERE LOWER(player) LIKE ?
        AND gender = ?
        ORDER BY
            CASE
                WHEN LOWER(player) LIKE ? THEN 1
                WHEN LOWER(player) LIKE ? THEN 2
                ELSE 3
            END,
            player
        LIMIT 20
    """
    
    # query prep
    like_q = f"%{q.lower()}%"
    prefix_q = f"{q.lower()}%"
    word_q = f"% {q.lower()}%"
    
    params = (like_q, gender, prefix_q, word_q)
    rows = query_all(query, params)
    return {"players": rows, "count": len(rows)}


@router.get("/predict/matchup-types")
def list_matchup_types():
    """List available role and against_type options for matchup predictions."""
    return get_available_matchup_types()


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


@router.get("/{name}/wpa")
def get_player_wpa_route(
    name: str,
    last_n: int = Query(10, ge=1, le=50),
    gender: str = "Men",
):
    """Get aggregated match swing (WPA) across last N matches. Clutch Impact %."""
    data = get_player_wpa(name, last_n=last_n, gender=gender)
    if not data:
        raise HTTPException(status_code=404, detail=f"Player '{name}' not found")
    return data


@router.get("/{name}/cis")
def get_player_cis_route(
    name: str,
    last_n: int = Query(10, ge=1, le=10),
    gender: str = "Men",
):
    """Get Counterfactual Impact Score (CIS), choke index, pressure isotherm data."""
    data = get_player_cis(name, last_n=last_n, gender=gender)
    if not data:
        raise HTTPException(status_code=404, detail=f"Player '{name}' not found")
    return data


# ---------------------------------------------------------------------------
# Predictions: impact vs opponent / venue / matchup type
# ---------------------------------------------------------------------------

@router.get("/{name}/predict")
def get_player_predict_vs_opponent(
    name: str,
    opponent: str = Query(..., description="Opponent team name (e.g. India, Australia)"),
    venue: str | None = Query(None, description="Optional venue for same-venue vs other-venue breakdown (when venue data exists)"),
    same_venue: bool = Query(False, description="If venue given, predict only at that venue"),
    gender: str = "Men",
):
    """
    Predict expected impact for a player against a specific opponent.
    Uses historical impact in matches vs that opponent (recency-weighted).
    Optionally: same venue vs other venues when venue data is available.
    """
    if venue and same_venue:
        data = predict_impact_vs_opponent_at_venue(name, opponent, venue, same_venue=True, gender=gender)
    else:
        data = predict_impact_vs_opponent(name, opponent, venue=venue, gender=gender)
    if not data:
        raise HTTPException(status_code=404, detail=f"Player '{name}' not found or no data")
    return data


@router.get("/{name}/predict/history")
def get_player_opponent_history(
    name: str,
    gender: str = "Men",
    max_innings: int = Query(100, ge=1, le=200),
):
    """Get player's innings with inferred opponent for each match (for building predictions)."""
    data = get_player_innings_with_opponent(name, gender=gender, max_innings=max_innings)
    if not data:
        raise HTTPException(status_code=404, detail=f"Player '{name}' not found")
    return {"player": name, "innings": data, "count": len(data)}


@router.get("/{name}/predict/matchup")
def get_player_predict_matchup(
    name: str,
    role: str = Query(..., description="batter or bowler"),
    against_type: str = Query(..., description="e.g. pace, spin (for batter); aggressive_batsman, accumulator (for bowler)"),
    gender: str = "Men",
    last_n: int = Query(10, ge=1, le=20),
):
    """
    Predict how a batsman will do against a type of bowler, or how a bowler will do against a type of batsman.
    Uses heuristic modifiers until delivery-level or type-aggregated data is available.
    """
    if role.lower() not in ("batter", "bowler"):
        raise HTTPException(status_code=400, detail="role must be 'batter' or 'bowler'")
    data = predict_matchup(name, role=role, against_type=against_type, gender=gender, last_n=last_n)
    if not data:
        raise HTTPException(status_code=404, detail=f"Player '{name}' not found")
    return data
