"""
wpa_service.py — Match Swing (WPA) service.

Uses existing batting_impact and bowling_impact from player_match_impacts
as ball-aggregated WPA. Serves per-match and per-player swing aggregates
and a synthetic timeline for charting when ball-by-ball is not available.
"""

from backend.database.db import query_all, query_one
from backend.services.impact_engine import ALLOWED_TEAMS


def _get_placeholders():
    return ",".join("?" for _ in ALLOWED_TEAMS)


def get_match_wpa(match_id: str, gender: str = "Men") -> dict | None:
    """
    Get per-player WPA (swing) aggregates for a match and a timeline placeholder.
    batting_impact + bowling_impact from DB are the match-level swing sums.
    """
    rows = query_all(
        """
        SELECT player, team, batting_impact, bowling_impact,
               runs_scored, balls_faced, wickets_taken, balls_bowled, runs_conceded
        FROM player_match_impacts
        WHERE match_id = ? AND gender = ?
        ORDER BY (batting_impact + bowling_impact) DESC
        """,
        (match_id, gender),
    )
    if not rows:
        return None

    per_player = []
    for r in rows:
        bat = r.get("batting_impact") or 0
        bowl = r.get("bowling_impact") or 0
        swing_sum = bat + bowl
        per_player.append({
            "player_id": r["player"],
            "player": r["player"],
            "team": r["team"],
            "swing_sum": round(swing_sum, 4),
            "swing_batting": round(bat, 4),
            "swing_bowling": round(bowl, 4),
            "swing_percent": round(swing_sum * 100, 2),
            "runs_scored": int(r.get("runs_scored") or 0),
            "wickets_taken": int(r.get("wickets_taken") or 0),
        })

    # Synthetic timeline: one "event" per player for chart (ball index approximated)
    # In a full implementation this would be ball-by-ball; here we emit one point per player
    wp_events = []
    cumulative_wp = 0.5
    for i, p in enumerate(per_player):
        swing = p["swing_sum"]
        cumulative_wp = max(0, min(1, cumulative_wp + swing))
        wp_events.append({
            "ball_index": i + 1,
            "over": (i // 6) + 1,
            "ball": (i % 6) + 1,
            "player": p["player"],
            "event": "match_contribution",
            "wp_before": round(cumulative_wp - swing, 4),
            "wp_after": round(cumulative_wp, 4),
            "swing": round(swing, 4),
            "attribution": {"batsman": p["swing_batting"], "bowler": p["swing_bowling"]},
        })

    return {
        "match_id": match_id,
        "gender": gender,
        "timeline": wp_events,
        "per_player": per_player,
        "num_events_attributed": len(wp_events),
    }


def get_player_wpa(player_name: str, last_n: int = 10, gender: str = "Men") -> dict | None:
    """
    Get aggregated WPA (match swing) across last N matches for a player.
    Clutch Impact % = average swing per match in percent points.
    """
    rows = query_all(
        """
        SELECT match_id, start_date, batting_impact, bowling_impact
        FROM player_match_impacts
        WHERE player = ? AND gender = ?
        ORDER BY start_date DESC
        LIMIT ?
        """,
        (player_name, gender, last_n),
    )
    if not rows:
        return None

    match_swings = []
    for r in rows:
        bat = r.get("batting_impact") or 0
        bowl = r.get("bowling_impact") or 0
        swing = bat + bowl
        match_swings.append({
            "match_id": r["match_id"],
            "date": r["start_date"],
            "swing_sum": round(swing, 4),
            "swing_batting": round(bat, 4),
            "swing_bowling": round(bowl, 4),
            "swing_percent": round(swing * 100, 2),
        })

    total_swing = sum(m["swing_sum"] for m in match_swings)
    avg_swing = total_swing / len(match_swings) if match_swings else 0
    clutch_impact_percent = round(avg_swing * 100, 2)

    return {
        "player": player_name,
        "gender": gender,
        "last_n": len(match_swings),
        "swing_sum_total": round(total_swing, 4),
        "swing_avg_per_match": round(avg_swing, 4),
        "clutch_impact_percent": clutch_impact_percent,
        "match_swings": match_swings,
    }
