"""
impact_engine.py — Three-Layer Impact Metric Calculation Engine.

Impact = Performance × Context × Pressure
  Layer 1: Performance Score (batting + bowling raw contribution)
  Layer 2: Match Context Weight (powerplay / middle / death overs)
  Layer 3: Pressure Index (required run rate, wickets remaining)

Recency-weighted over last N innings, normalized 0-100.
"""

import numpy as np
from math import exp
from api._backend.database.db import query_all

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

ALLOWED_TEAMS = [
    "Australia", "England", "South Africa", "West Indies", "New Zealand",
    "India", "Pakistan", "Sri Lanka", "Zimbabwe", "Bangladesh",
    "Afghanistan", "Ireland", "Canada", "Italy", "Nepal", "Oman",
    "Scotland", "United States of America", "United Arab Emirates",
    "Netherlands", "Namibia",
]

RECENCY_LAMBDA = 0.15
MIN_INNINGS_LEADERBOARD = 10
MAX_LAST_N = 10

# Category thresholds
CATEGORIES = [
    (80, "Match Winner"),
    (60, "High Impact"),
    (40, "Neutral"),
    (20, "Low Impact"),
    (0,  "Poor Impact"),
]

EXPLAIN_PAYLOAD = {
    "summary": "Impact = Performance × Context × Pressure, normalized 0-100, recency-weighted over last N innings.",
    "batting_formula": "0.5×runs + 0.2×strike_rate + 0.2×boundary_value + 0.1×(-0.5×dot_balls)",
    "bowling_formula": "0.6×(wickets×25) + 0.3×max(0,(8−economy)×5) + 0.1×dot_balls",
    "context_phases": {"powerplay (overs 1-6)": 1.2, "middle (overs 7-15)": 1.0, "death (overs 16-20)": 1.4},
    "pressure_limits": {"min": 1.0, "max": 2.5, "first_innings_default": 1.05},
    "recency_lambda": RECENCY_LAMBDA,
    "categories": {
        "80-100": "Match Winner (Elite)",
        "60-80": "High Impact",
        "40-60": "Neutral",
        "20-40": "Low Impact",
        "0-20": "Poor Impact",
    },
    "plain_english": [
        "Performance combines batting (runs, strike rate, boundaries, dot balls) and bowling (wickets, economy, dot balls).",
        "Context multiplies performance by game phase — powerplay and death overs are more important than middle overs.",
        "Pressure increases impact for high-pressure situations like chasing a big total with few wickets left.",
        "Recency: last N innings are weighted so recent form matters more (exponential decay λ=0.15).",
        "Scores are normalized 0-100 across all players from major cricket nations.",
    ],
}


# ---------------------------------------------------------------------------
# Layer 1 — Performance Score
# ---------------------------------------------------------------------------

def _batting_performance(runs_scored, balls_faced, fours=0, sixes=0, dot_balls=0):
    """Compute raw batting performance score."""
    if balls_faced <= 0:
        return 0.0
    strike_rate = (runs_scored / balls_faced) * 100
    boundary_score = fours * 4 + sixes * 6
    dot_penalty = dot_balls * -0.5
    return (
        (runs_scored * 0.5)
        + (strike_rate * 0.2)
        + (boundary_score * 0.2)
        + (dot_penalty * 0.1)
    )


def _bowling_performance(wickets, overs_bowled, runs_conceded, dot_balls=0):
    """Compute raw bowling performance score."""
    if overs_bowled <= 0:
        return 0.0
    economy_rate = runs_conceded / overs_bowled
    wicket_score = wickets * 25
    economy_score = max(0, (8 - economy_rate) * 5)
    dot_ball_score = dot_balls * 1
    return (
        (wicket_score * 0.6)
        + (economy_score * 0.3)
        + (dot_ball_score * 0.1)
    )


# ---------------------------------------------------------------------------
# Layer 2 — Context Weight
# ---------------------------------------------------------------------------

def _context_weight_for_over(over):
    """Phase multiplier depending on over number."""
    if over <= 6:
        return 1.2
    elif over >= 16:
        return 1.4
    return 1.0


def _estimate_context_weight(balls_faced, balls_bowled):
    """
    Approximate context weight from innings data when detailed over info
    is unavailable. Uses a heuristic based on typical batting position
    inferred from balls faced (late-order batters face fewer balls in
    higher-pressure death overs).
    """
    total_involvement = (balls_faced or 0) + (balls_bowled or 0)
    if total_involvement <= 0:
        return 1.0
    # Heuristic: more involvement ⟹ likely present across phases ⟹ ~1.1
    # Low involvement ⟹ could be death-over specialist ⟹ ~1.3
    if total_involvement <= 12:
        return 1.3   # likely specialist short spell / death-over burst
    elif total_involvement <= 30:
        return 1.15
    return 1.05  # played across all phases


# ---------------------------------------------------------------------------
# Layer 3 — Pressure Index
# ---------------------------------------------------------------------------

def _pressure_index(batting_impact, bowling_impact, runs_scored, wickets_taken,
                    balls_faced, balls_bowled):
    """
    Estimate pressure index from aggregated match data.
    When detailed chase/target info is unavailable, we use a proxy:
    high positive impact in a match with significant contributions
    implies the player performed under pressure.
    """
    total_impact = abs(batting_impact) + abs(bowling_impact)
    contribution = (runs_scored or 0) + (wickets_taken or 0) * 20

    # Base pressure
    pressure = 1.05  # default slight boost

    # If bat impact is strongly positive, player likely performed well under pressure
    if batting_impact > 0.05:
        pressure += min(batting_impact * 5, 0.8)
    elif batting_impact < -0.03:
        pressure += 0.1  # even failing under pressure shows context

    # Death-over bowling with wickets is high pressure
    if wickets_taken and wickets_taken >= 2 and bowling_impact > 0.03:
        pressure += 0.3

    return max(1.0, min(pressure, 2.5))


# ---------------------------------------------------------------------------
# Per-innings 3-layer impact
# ---------------------------------------------------------------------------

def _compute_innings_impact(row):
    """Compute three-layer impact for a single innings row (dict)."""
    runs = row.get("runs_scored", 0) or 0
    bf = row.get("balls_faced", 0) or 0
    wkts = row.get("wickets_taken", 0) or 0
    bb = row.get("balls_bowled", 0) or 0
    rc = row.get("runs_conceded", 0) or 0
    bat_imp = row.get("batting_impact", 0) or 0
    bowl_imp = row.get("bowling_impact", 0) or 0

    # Approximate overs bowled from balls
    overs_bowled = bb / 6.0 if bb else 0

    # Layer 1
    bat_perf = _batting_performance(runs, bf)
    bowl_perf = _bowling_performance(wkts, overs_bowled, rc)
    performance = bat_perf + bowl_perf

    # Layer 2
    context = _estimate_context_weight(bf, bb)

    # Layer 3
    pressure = _pressure_index(bat_imp, bowl_imp, runs, wkts, bf, bb)

    raw_impact = performance * context * pressure

    return {
        "batting_performance": round(bat_perf, 2),
        "bowling_performance": round(bowl_perf, 2),
        "performance_score": round(performance, 2),
        "context_weight": round(context, 2),
        "pressure_index": round(pressure, 2),
        "raw_impact": round(raw_impact, 2),
    }


# ---------------------------------------------------------------------------
# Categorization
# ---------------------------------------------------------------------------

def _categorize(score):
    """Map normalized 0-100 score to category string."""
    if score is None:
        return "Unknown"
    for threshold, label in CATEGORIES:
        if score >= threshold:
            return label
    return "Poor Impact"


# ---------------------------------------------------------------------------
# Player Impact (public API)
# ---------------------------------------------------------------------------

def get_player_impact_data(player_name: str, last_n: int = 10, gender: str = "Men") -> dict | None:
    """
    Compute 3-layer impact for a player using their last N innings from DB.
    Returns full breakdown including per-innings details, aggregated stats,
    normalized score, and explainability payload.
    """
    last_n = max(1, min(last_n, MAX_LAST_N))

    rows = query_all(
        """
        SELECT match_id, start_date, batting_impact, bowling_impact,
               match_impact, impact_score, runs_scored, balls_faced,
               wickets_taken, balls_bowled, runs_conceded, team, gender
        FROM player_match_impacts
        WHERE player = ? AND gender = ?
        ORDER BY start_date DESC
        """,
        (player_name, gender),
    )

    if not rows:
        return None

    total_innings = len(rows)
    recent = rows[:last_n]

    # Compute per-innings 3-layer impact
    innings_details = []
    raw_impacts = []
    weights = []

    for idx, row in enumerate(recent):
        components = _compute_innings_impact(row)
        weight = exp(-RECENCY_LAMBDA * idx)
        weights.append(weight)
        raw_impacts.append(components["raw_impact"])

        innings_details.append({
            "match_id": row["match_id"],
            "date": row["start_date"],
            "team": row["team"],
            "runs": int(row.get("runs_scored", 0) or 0),
            "balls_faced": int(row.get("balls_faced", 0) or 0),
            "wickets": int(row.get("wickets_taken", 0) or 0),
            "balls_bowled": int(row.get("balls_bowled", 0) or 0),
            "runs_conceded": int(row.get("runs_conceded", 0) or 0),
            "batting_performance": components["batting_performance"],
            "bowling_performance": components["bowling_performance"],
            "performance_score": components["performance_score"],
            "context_weight": components["context_weight"],
            "pressure_index": components["pressure_index"],
            "raw_impact": components["raw_impact"],
            "wpa_batting": round(row.get("batting_impact", 0) or 0, 4),
            "wpa_bowling": round(row.get("bowling_impact", 0) or 0, 4),
        })

    # Recency-weighted average
    weights = np.array(weights)
    raw_arr = np.array(raw_impacts)
    impact_weighted = float(np.sum(raw_arr * weights) / max(np.sum(weights), 1e-9))

    # Aggregate stats for last N
    total_runs = sum(d["runs"] for d in innings_details)
    total_balls = sum(d["balls_faced"] for d in innings_details)
    total_wkts = sum(d["wickets"] for d in innings_details)
    total_bb = sum(d["balls_bowled"] for d in innings_details)
    total_rc = sum(d["runs_conceded"] for d in innings_details)
    dismissals = max(1, len(recent) - 1)  # rough estimate

    last_n_stats = {
        "innings": len(recent),
        "runs": total_runs,
        "balls_faced": total_balls,
        "strike_rate": round((total_runs / max(total_balls, 1)) * 100, 1),
        "batting_average": round(total_runs / dismissals, 1),
        "wickets": total_wkts,
        "balls_bowled": total_bb,
        "runs_conceded": total_rc,
        "bowling_strike_rate": round(total_bb / max(total_wkts, 1), 1) if total_wkts else None,
        "bowling_average": round(total_rc / max(total_wkts, 1), 1) if total_wkts else None,
        "economy": round((total_rc / max(total_bb / 6, 1)), 2) if total_bb else None,
    }

    avg_context = np.mean([d["context_weight"] for d in innings_details])
    avg_pressure = np.mean([d["pressure_index"] for d in innings_details])

    return {
        "player_name": player_name,
        "team": recent[0]["team"],
        "gender": recent[0]["gender"],
        "total_innings": total_innings,
        "last_n_count": len(recent),
        "impact_weighted": round(impact_weighted, 2),
        "impact_normalized": None,  # filled by caller after global normalization
        "category": None,
        "batting_impact_component": round(np.mean([d["batting_performance"] for d in innings_details]), 2),
        "bowling_impact_component": round(np.mean([d["bowling_performance"] for d in innings_details]), 2),
        "context_weight_avg": round(float(avg_context), 2),
        "pressure_index_avg": round(float(avg_pressure), 2),
        "last_n_stats": last_n_stats,
        "last_n_innings": innings_details,
        "explain": EXPLAIN_PAYLOAD,
    }


# ---------------------------------------------------------------------------
# Leaderboard (public API)
# ---------------------------------------------------------------------------

def get_leaderboard_data(
    min_innings: int = MIN_INNINGS_LEADERBOARD,
    teams: list | None = None,
    role: str | None = None,
    top_k: int = 50,
    last_n: int = MAX_LAST_N,
    gender: str = "Men",
) -> list[dict]:
    """
    Compute leaderboard: recency-weighted 3-layer impact for all eligible players.
    Filters by team, min innings, and role. Returns sorted list.
    """
    from collections import defaultdict
    if teams is None:
        teams = ALLOWED_TEAMS

    # Build team placeholders for SQL
    placeholders = ",".join("?" for _ in teams)

    # Get players with enough innings in allowed teams
    players = query_all(
        f"""
        SELECT player, team, COUNT(*) as total_innings,
               SUM(runs_scored) as total_runs,
               SUM(wickets_taken) as total_wickets,
               SUM(batting_impact) as sum_batting,
               SUM(bowling_impact) as sum_bowling
        FROM player_match_impacts
        WHERE team IN ({placeholders}) AND gender = ?
        GROUP BY player
        HAVING COUNT(*) >= ?
        """,
        (*teams, gender, min_innings),
    )

    if not players:
        return []

    # Apply role filter
    if role == "batter":
        players = [p for p in players if (p["sum_batting"] or 0) > (p["sum_bowling"] or 0)]
    elif role == "bowler":
        players = [p for p in players if (p["sum_bowling"] or 0) >= (p["sum_batting"] or 0)]

    valid_players = {p["player"]: p for p in players}
    if not valid_players:
        return []

    # Fetch last N innings for all players in one optimized query
    innings_rows = query_all(
        f"""
        SELECT * FROM (
            SELECT match_id, start_date, batting_impact, bowling_impact,
                   match_impact, runs_scored, balls_faced, wickets_taken,
                   balls_bowled, runs_conceded, team, player,
                   ROW_NUMBER() OVER (PARTITION BY player ORDER BY start_date DESC) as rn
            FROM player_match_impacts
            WHERE team IN ({placeholders}) AND gender = ?
        )
        WHERE rn <= ?
        """,
        (*teams, gender, last_n),
    )

    player_innings = defaultdict(list)
    for row in innings_rows:
        if row["player"] in valid_players:
            player_innings[row["player"]].append(row)

    # Compute impact for each player
    results = []
    for p_name, p in valid_players.items():
        innings = sorted(player_innings.get(p_name, []), key=lambda x: x["start_date"] or "", reverse=True)

        if not innings:
            continue

        raw_impacts = []
        weights = []
        for idx, row in enumerate(innings):
            components = _compute_innings_impact(row)
            w = exp(-RECENCY_LAMBDA * idx)
            weights.append(w)
            raw_impacts.append(components["raw_impact"])

        w_arr = np.array(weights)
        r_arr = np.array(raw_impacts)
        impact_weighted = float(np.sum(r_arr * w_arr) / max(np.sum(w_arr), 1e-9))

        results.append({
            "player": p["player"],
            "team": p["team"],
            "total_innings": p["total_innings"],
            "last_n_count": len(innings),
            "impact_weighted": impact_weighted,
            "total_runs": int(p["total_runs"] or 0),
            "total_wickets": int(p["total_wickets"] or 0),
            "batting_impact": round(float(p["sum_batting"] or 0), 4),
            "bowling_impact": round(float(p["sum_bowling"] or 0), 4),
        })

    if not results:
        return []

    # Normalize across all eligible players
    weighted_vals = np.array([r["impact_weighted"] for r in results])
    mn, mx = weighted_vals.min(), weighted_vals.max()
    spread = mx - mn if (mx - mn) > 1e-6 else 1.0

    for r in results:
        r["impact_score"] = round(float(100 * (r["impact_weighted"] - mn) / spread), 1)
        r["impact_score"] = max(0.0, min(100.0, r["impact_score"]))
        r["category"] = _categorize(r["impact_score"])

    # Sort: impact_score desc, then total_innings desc
    results.sort(key=lambda x: (-x["impact_score"], -x["total_innings"]))

    return results[:top_k]


# ---------------------------------------------------------------------------
# Match Impact (public API)
# ---------------------------------------------------------------------------

def get_match_impact_data(match_id: str, gender: str = "Men") -> dict | None:
    """Compute 3-layer impact breakdown for all players in a match."""
    rows = query_all(
        """
        SELECT player, team, batting_impact, bowling_impact,
               match_impact, impact_score, runs_scored, balls_faced,
               wickets_taken, balls_bowled, runs_conceded, start_date
        FROM player_match_impacts
        WHERE match_id = ? AND gender = ?
        ORDER BY match_impact DESC
        """,
        (match_id, gender),
    )

    if not rows:
        return None

    players = []
    for row in rows:
        components = _compute_innings_impact(row)
        players.append({
            "player": row["player"],
            "team": row["team"],
            "runs_scored": int(row.get("runs_scored") or 0),
            "balls_faced": int(row.get("balls_faced") or 0),
            "wickets_taken": int(row.get("wickets_taken") or 0),
            "balls_bowled": int(row.get("balls_bowled") or 0),
            "runs_conceded": int(row.get("runs_conceded") or 0),
            "wpa_batting": round(row.get("batting_impact") or 0, 4),
            "wpa_bowling": round(row.get("bowling_impact") or 0, 4),
            "wpa_match": round(row.get("match_impact") or 0, 4),
            **components,
        })

    # Normalize raw_impact within match for comparison
    raw_vals = [p["raw_impact"] for p in players]
    mn, mx = min(raw_vals), max(raw_vals)
    spread = mx - mn if mx - mn > 1e-6 else 1.0
    for p in players:
        p["impact_normalized"] = round(100 * (p["raw_impact"] - mn) / spread, 1)
        p["category"] = _categorize(p["impact_normalized"])

    teams = {}
    for p in players:
        t = p["team"]
        if t not in teams:
            teams[t] = []
        teams[t].append(p)

    return {
        "match_id": match_id,
        "date": rows[0]["start_date"] if rows else None,
        "teams": teams,
        "players": players,
    }


# ---------------------------------------------------------------------------
# Normalize a single player's score relative to leaderboard
# ---------------------------------------------------------------------------

def normalize_player_score(impact_weighted: float, gender: str = "Men") -> tuple[float, str]:
    """
    Quick normalization using global statistics from allowed teams.
    Returns (normalized_score, category).
    """
    placeholders = ",".join("?" for _ in ALLOWED_TEAMS)
    stats = query_all(
        f"""
        SELECT player, team,
               SUM(runs_scored) as runs, SUM(balls_faced) as bf,
               SUM(wickets_taken) as wkts, SUM(balls_bowled) as bb,
               SUM(runs_conceded) as rc,
               AVG(batting_impact) as avg_bat, AVG(bowling_impact) as avg_bowl
        FROM player_match_impacts
        WHERE team IN ({placeholders}) AND gender = ?
        GROUP BY player
        HAVING COUNT(*) >= 5
        """,
        (*ALLOWED_TEAMS, gender),
    )

    if not stats:
        return 50.0, "Neutral"

    # Compute approximate raw impacts for context
    all_weighted = []
    for s in stats:
        runs = s["runs"] or 0
        bf = s["bf"] or 0
        wkts = s["wkts"] or 0
        bb = s["bb"] or 0
        rc = s["rc"] or 0
        overs = (bb or 0) / 6.0
        bat_perf = _batting_performance(runs, bf) / max(1, bf // 30)
        bowl_perf = _bowling_performance(wkts, overs, rc) / max(1, bb // 24) if bb else 0
        all_weighted.append(bat_perf + bowl_perf)

    if not all_weighted:
        return 50.0, "Neutral"

    mn = min(all_weighted)
    mx = max(all_weighted)
    spread = mx - mn if mx - mn > 1e-6 else 1.0
    normalized = 100 * (impact_weighted - mn) / spread
    normalized = max(0.0, min(100.0, round(normalized, 1)))
    return normalized, _categorize(normalized)
