"""
prediction_service.py — Impact predictions by opponent, venue, and matchup type.

- Predict impact vs a specific opponent (same venue vs other venues when venue data exists).
- Predict batsman impact vs bowler type / bowler impact vs batsman type (heuristic until
  delivery-level or type-aggregated data is available).
"""

from math import exp
import numpy as np
from backend.database.db import query_all
from backend.services.impact_engine import (
    ALLOWED_TEAMS,
    _compute_innings_impact,
    RECENCY_LAMBDA,
    normalize_player_score,
)


def _get_opponent_for_matches(gender: str):
    """Return dict match_id -> [team1, team2] for all matches (allowed teams only)."""
    placeholders = ",".join("?" for _ in ALLOWED_TEAMS)
    rows = query_all(
        f"""
        SELECT match_id, team
        FROM player_match_impacts
        WHERE team IN ({placeholders}) AND gender = ?
        GROUP BY match_id, team
        """,
        (*ALLOWED_TEAMS, gender),
    )
    by_match = {}
    for r in rows:
        mid = r["match_id"]
        if mid not in by_match:
            by_match[mid] = []
        if r["team"] not in by_match[mid]:
            by_match[mid].append(r["team"])
    return by_match


def get_player_innings_with_opponent(player_name: str, gender: str = "Men", max_innings: int = 100):
    """
    Get player's innings with inferred opponent (other team in the match).
    Returns list of dicts: match_id, date, team, opponent, raw_impact, and 3-layer components.
    """
    match_teams = _get_opponent_for_matches(gender)
    rows = query_all(
        """
        SELECT match_id, start_date, batting_impact, bowling_impact,
               match_impact, impact_score, runs_scored, balls_faced,
               wickets_taken, balls_bowled, runs_conceded, team, gender
        FROM player_match_impacts
        WHERE player = ? AND gender = ?
        ORDER BY start_date DESC
        LIMIT ?
        """,
        (player_name, gender, max_innings),
    )
    if not rows:
        return []

    out = []
    for row in rows:
        mid = row["match_id"]
        my_team = row["team"]
        teams_in_match = match_teams.get(mid, [])
        opponent = None
        if len(teams_in_match) >= 2:
            opponent = next((t for t in teams_in_match if t != my_team), teams_in_match[0] if teams_in_match else None)
        elif len(teams_in_match) == 1 and teams_in_match[0] != my_team:
            opponent = teams_in_match[0]

        comp = _compute_innings_impact(row)
        out.append({
            "match_id": mid,
            "date": row["start_date"],
            "team": my_team,
            "opponent": opponent,
            "raw_impact": comp["raw_impact"],
            "performance_score": comp["performance_score"],
            "context_weight": comp["context_weight"],
            "pressure_index": comp["pressure_index"],
        })
    return out


def predict_impact_vs_opponent(
    player_name: str,
    opponent: str,
    venue: str | None = None,
    gender: str = "Men",
    use_recency_weight: bool = True,
):
    """
    Predict expected impact for a player against a specific opponent.
    Optionally filter by venue (when venue column is available in the future).
    Returns predicted raw impact, normalized score, sample size, and breakdown by same_venue vs other_venue if venue given.
    """
    innings = get_player_innings_with_opponent(player_name, gender=gender)
    vs_opponent = [inn for inn in innings if inn.get("opponent") and inn["opponent"].lower() == opponent.strip().lower()]
    if not vs_opponent:
        # No history vs this opponent: return overall recent form as fallback
        all_recent = innings[:15]
        if not all_recent:
            return None
        raw_list = [inn["raw_impact"] for inn in all_recent]
        weights = np.array([exp(-RECENCY_LAMBDA * i) for i in range(len(all_recent))]) if use_recency_weight else np.ones(len(all_recent))
        weights = weights / weights.sum()
        pred_raw = float(np.dot(raw_list, weights))
        norm, cat = normalize_player_score(pred_raw, gender)
        return {
            "player": player_name,
            "opponent": opponent,
            "predicted_raw_impact": round(pred_raw, 2),
            "predicted_normalized_score": round(norm, 1),
            "category": cat,
            "sample_size": 0,
            "note": "No history vs this opponent; prediction uses overall recent form.",
            "by_venue": None,
        }

    raw_list = [inn["raw_impact"] for inn in vs_opponent]
    if use_recency_weight:
        weights = np.array([exp(-RECENCY_LAMBDA * i) for i in range(len(vs_opponent))])
        weights = weights / weights.sum()
        pred_raw = float(np.dot(raw_list, weights))
    else:
        pred_raw = float(np.mean(raw_list))

    norm, cat = normalize_player_score(pred_raw, gender)

    result = {
        "player": player_name,
        "opponent": opponent,
        "predicted_raw_impact": round(pred_raw, 2),
        "predicted_normalized_score": round(norm, 1),
        "category": cat,
        "sample_size": len(vs_opponent),
        "note": None,
        "by_venue": None,
    }

    # When venue is supported in schema, split vs_opponent by venue and add same_venue_avg / other_venue_avg
    # For now we don't have venue in DB, so by_venue stays None.
    return result


def predict_impact_vs_opponent_at_venue(
    player_name: str,
    opponent: str,
    venue: str,
    same_venue: bool,
    gender: str = "Men",
):
    """
    Predict impact vs opponent either at the same venue or at other venues.
    When venue data is not in DB, falls back to overall vs opponent.
    """
    # Placeholder: once we have venue on matches, filter get_player_innings_with_opponent by venue
    pred = predict_impact_vs_opponent(player_name, opponent, venue=venue, gender=gender)
    if not pred:
        return None
    pred["venue_requested"] = venue
    pred["same_venue_only"] = same_venue
    pred["note"] = "Venue filtering not yet available; prediction is overall vs opponent."
    return pred


# ---------------------------------------------------------------------------
# Matchup: batsman vs bowler type / bowler vs batsman type
# ---------------------------------------------------------------------------

# Heuristic modifiers when delivery-level data is not available.
# Format: (role, against_type) -> multiplier on baseline impact (1.0 = no change).
MATCHUP_MODIFIERS = {
    ("batter", "pace"): 1.0,
    ("batter", "spin"): 1.0,
    ("batter", "aggressive_bowler"): 0.95,
    ("batter", "defensive_bowler"): 1.05,
    ("bowler", "aggressive_batsman"): 1.05,
    ("bowler", "accumulator"): 0.95,
    ("bowler", "pace_hitter"): 1.0,
    ("bowler", "spin_player"): 1.0,
}

BATSMAN_TYPES = ["aggressive", "accumulator"]
BOWLER_TYPES = ["pace", "spin", "aggressive_bowler", "defensive_bowler"]


def _infer_batsman_type_from_career(player_name: str, gender: str) -> str:
    """Infer batsman type from career strike rate (heuristic)."""
    placeholders = ",".join("?" for _ in ALLOWED_TEAMS)
    row = query_all(
        f"""
        SELECT SUM(runs_scored) as runs, SUM(balls_faced) as bf
        FROM player_match_impacts
        WHERE player = ? AND gender = ? AND team IN ({placeholders})
        """,
        (player_name, gender, *ALLOWED_TEAMS),
    )
    if not row or not row[0].get("bf") or row[0]["bf"] < 30:
        return "accumulator"
    runs, bf = row[0].get("runs") or 0, row[0].get("bf") or 1
    sr = (runs / bf) * 100
    return "aggressive" if sr >= 130 else "accumulator"


def predict_matchup(
    player_name: str,
    role: str,
    against_type: str,
    gender: str = "Men",
    last_n: int = 10,
):
    """
    Predict impact for a player in a matchup context:
    - role=batter, against_type=pace|spin|aggressive_bowler|defensive_bowler
    - role=bowler, against_type=aggressive_batsman|accumulator|pace_hitter|spin_player

    Without delivery-level data, uses player's overall impact and a heuristic modifier.
    """
    from backend.services.impact_engine import get_player_impact_data

    data = get_player_impact_data(player_name, last_n=last_n, gender=gender)
    if not data:
        return None

    base_raw = data["impact_weighted"]
    norm, cat = normalize_player_score(base_raw, gender)
    key = (role.lower(), against_type.lower().replace(" ", "_"))
    modifier = MATCHUP_MODIFIERS.get(key, 1.0)
    adjusted_raw = base_raw * modifier
    adj_norm, adj_cat = normalize_player_score(adjusted_raw, gender)

    return {
        "player": player_name,
        "role": role,
        "against_type": against_type,
        "base_raw_impact": round(base_raw, 2),
        "base_normalized_score": round(norm, 1),
        "matchup_modifier": modifier,
        "predicted_raw_impact": round(adjusted_raw, 2),
        "predicted_normalized_score": round(adj_norm, 1),
        "predicted_category": adj_cat,
        "note": "Heuristic modifier; for accurate matchup predictions, delivery-level or type-aggregated data is required.",
        "sample_size": data.get("last_n_count", 0),
    }


def get_available_matchup_types():
    """Return available role and against_type options for matchup prediction."""
    return {
        "batter": {
            "against_type": BOWLER_TYPES,
            "description": "Predict how a batsman will do against different types of bowlers.",
        },
        "bowler": {
            "against_type": ["aggressive_batsman", "accumulator", "pace_hitter", "spin_player"],
            "description": "Predict how a bowler will do against different types of batsmen.",
        },
    }
