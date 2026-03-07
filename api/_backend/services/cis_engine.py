"""
cis_engine.py — Counterfactual Impact Scoring (CIS) with replacement baselines.

CIS_raw = w1 * ΔRuns + w2 * runs_equiv_from_ΔSR + w3 * ΔWPA
Replacement baseline = global median (by gender) with optional shrinkage.
Choke Index = avg_CIS_high_pressure / avg_CIS_low_pressure.
"""

import numpy as np
from math import exp
from api._backend.database.db import query_all
from api._backend.services.impact_engine import (
    get_player_impact_data,
    ALLOWED_TEAMS,
    RECENCY_LAMBDA,
    MAX_LAST_N,
)

# Weights for CIS_raw combination (tune as needed)
W1_RUNS = 0.6
W2_SR = 0.2
W3_WPA = 0.2
RUN_VALUE_PER_BALL = 0.15  # approximate runs per ball for SR conversion

# Choke Index pressure threshold (pressure_index >= this = high pressure)
HIGH_PRESSURE_THRESHOLD = 1.4
MIN_HIGH_PRESSURE_INNINGS = 2  # below this, report "insufficient sample"

# Normalization: 50 = replacement level
CIS_MEDIAN_TARGET = 50.0


def _get_placeholders():
    return ",".join("?" for _ in ALLOWED_TEAMS)


def compute_global_baseline(gender: str) -> dict:
    """
    Compute replacement baseline from all historical innings (allowed teams, gender).
    Returns median runs, median SR, median WPA for use as baseline.
    """
    placeholders = _get_placeholders()
    rows = query_all(
        f"""
        SELECT runs_scored, balls_faced, batting_impact, bowling_impact
        FROM player_match_impacts
        WHERE team IN ({placeholders}) AND gender = ?
        """,
        (*ALLOWED_TEAMS, gender),
    )
    if not rows:
        return {
            "median_runs": 15.0,
            "median_sr": 120.0,
            "median_wpa": 0.0,
            "n": 0,
        }

    runs = [r["runs_scored"] or 0 for r in rows]
    bf = [max(1, r["balls_faced"] or 0) for r in rows]
    sr = [(runs[i] / bf[i]) * 100 for i in range(len(rows))]
    wpa = [(r["batting_impact"] or 0) + (r["bowling_impact"] or 0) for r in rows]

    return {
        "median_runs": float(np.median(runs)),
        "median_sr": float(np.median(sr)),
        "median_wpa": float(np.median(wpa)),
        "n": len(rows),
    }


def compute_cis_for_innings(innings_row: dict, baseline: dict) -> dict:
    """
    Compute per-innings CIS components and CIS_raw.
    innings_row: has runs, balls_faced, wickets, wpa_batting, wpa_bowling, pressure_index.
    """
    runs = int(innings_row.get("runs", 0) or 0)
    bf = int(innings_row.get("balls_faced", 0) or 0)
    wpa_bat = float(innings_row.get("wpa_batting", 0) or 0)
    wpa_bowl = float(innings_row.get("wpa_bowling", 0) or 0)
    wpa_actual = wpa_bat + wpa_bowl

    actual_sr = (runs / bf * 100) if bf else baseline["median_sr"]
    delta_runs = runs - baseline["median_runs"]
    delta_sr = actual_sr - baseline["median_sr"]
    delta_wpa = wpa_actual - baseline["median_wpa"]

    # Runs equivalent from SR delta: (ΔSR/100) * balls * run_value
    balls = max(bf, 1)
    runs_equiv_sr = (delta_sr / 100) * balls * RUN_VALUE_PER_BALL

    cis_raw = (
        W1_RUNS * delta_runs
        + W2_SR * runs_equiv_sr
        + W3_WPA * delta_wpa
    )

    return {
        "delta_runs": round(delta_runs, 2),
        "delta_sr": round(delta_sr, 2),
        "delta_wpa": round(delta_wpa, 4),
        "cis_raw": round(cis_raw, 4),
        "baseline_runs": baseline["median_runs"],
        "baseline_sr": baseline["median_sr"],
        "baseline_wpa": baseline["median_wpa"],
    }


def get_player_cis(player_name: str, last_n: int = 10, gender: str = "Men") -> dict | None:
    """
    Get aggregated CIS, per-innings deltas, choke index, and pressure isotherm data.
    """
    last_n = max(1, min(last_n, MAX_LAST_N))
    impact_data = get_player_impact_data(player_name, last_n=last_n, gender=gender)
    if not impact_data or not impact_data.get("last_n_innings"):
        return None

    baseline = compute_global_baseline(gender)
    innings_details = impact_data["last_n_innings"]

    per_innings = []
    cis_raws = []
    weights = []
    high_pressure_cis = []
    low_pressure_cis = []

    for idx, inn in enumerate(innings_details):
        comp = compute_cis_for_innings(inn, baseline)
        w = exp(-RECENCY_LAMBDA * idx)
        weights.append(w)
        cis_raws.append(comp["cis_raw"])
        per_innings.append({
            **inn,
            "delta_runs": comp["delta_runs"],
            "delta_sr": comp["delta_sr"],
            "delta_wpa": comp["delta_wpa"],
            "cis_raw": comp["cis_raw"],
            "baseline_runs": comp["baseline_runs"],
            "baseline_sr": comp["baseline_sr"],
            "baseline_wpa": comp["baseline_wpa"],
        })
        pressure = inn.get("pressure_index") or 1.0
        if pressure >= HIGH_PRESSURE_THRESHOLD:
            high_pressure_cis.append(comp["cis_raw"])
        else:
            low_pressure_cis.append(comp["cis_raw"])

    # Recency-weighted CIS raw aggregate
    w_arr = np.array(weights)
    c_arr = np.array(cis_raws)
    cis_raw_agg = float(np.sum(c_arr * w_arr) / max(np.sum(w_arr), 1e-9))

    # Choke Index
    avg_high = np.mean(high_pressure_cis) if len(high_pressure_cis) >= MIN_HIGH_PRESSURE_INNINGS else None
    avg_low = np.mean(low_pressure_cis) if low_pressure_cis else 1e-9
    if avg_high is not None and avg_low != 0:
        choke_index = float(avg_high / max(abs(avg_low), 1e-9))
    else:
        choke_index = None  # insufficient high-pressure sample

    # Normalize CIS to 0-100 (50 = replacement): use cohort stats
    placeholders = _get_placeholders()
    cohort = query_all(
        f"""
        SELECT player FROM player_match_impacts
        WHERE team IN ({placeholders}) AND gender = ?
        GROUP BY player HAVING COUNT(*) >= 5
        """,
        (*ALLOWED_TEAMS, gender),
    )
    if len(cohort) < 10:
        cis_norm = 50.0 + cis_raw_agg  # fallback: raw as offset from 50
    else:
        # Approximate: scale by MAD or simple linear
        cis_norm = 50.0 + np.clip(cis_raw_agg * 2.0, -50, 50)
    cis_norm = max(0.0, min(100.0, round(cis_norm, 1)))

    # Pressure isotherm grid: pressure_bin x innings_sequence, value = cis_raw
    pressure_bins = []
    for i, inn in enumerate(per_innings):
        pressure = inn.get("pressure_index") or 1.0
        pressure_bins.append({
            "rrr": pressure,  # reuse as x-axis pressure level
            "wickets": min(9, int(inn.get("wickets", 0))),  # placeholder if needed
            "impact": inn["cis_raw"],
            "innings_index": i + 1,
            "count": 1,
        })

    return {
        "player": impact_data.get("player_name") or player_name,
        "team": impact_data["team"],
        "gender": gender,
        "last_n_count": len(per_innings),
        "cis_raw_agg": round(cis_raw_agg, 4),
        "cis_norm": cis_norm,
        "choke_index": round(choke_index, 2) if choke_index is not None else None,
        "choke_high_pressure_innings": len(high_pressure_cis),
        "choke_low_pressure_innings": len(low_pressure_cis),
        "components": {
            "avg_delta_runs": round(float(np.mean([x["delta_runs"] for x in per_innings])), 2),
            "avg_delta_sr": round(float(np.mean([x["delta_sr"] for x in per_innings])), 2),
            "avg_delta_wpa": round(float(np.mean([x["delta_wpa"] for x in per_innings])), 4),
            "context_weight_avg": impact_data.get("context_weight_avg"),
        },
        "baseline": baseline,
        "last_n_innings": per_innings,
        "pressure_isotherm_data": pressure_bins,
        "explain": {
            "formula": "CIS_raw = 0.6*ΔRuns + 0.2*runs_equiv(ΔSR) + 0.2*ΔWPA",
            "replacement_level": 50,
            "choke_formula": "Choke Index = avg(CIS) in high pressure / avg(CIS) in low pressure",
            "high_pressure_threshold": HIGH_PRESSURE_THRESHOLD,
        },
    }


def get_cis_leaderboard(gender: str = "Men", min_innings: int = 10, top_k: int = 100) -> list[dict]:
    """Leaderboard sorted by CIS normalized (50 = replacement)."""
    placeholders = _get_placeholders()
    players = query_all(
        f"""
        SELECT player, team, COUNT(*) as total_innings
        FROM player_match_impacts
        WHERE team IN ({placeholders}) AND gender = ?
        GROUP BY player
        HAVING COUNT(*) >= ?
        """,
        (*ALLOWED_TEAMS, gender, min_innings),
    )
    results = []
    for p in players:
        cis_data = get_player_cis(p["player"], last_n=MAX_LAST_N, gender=gender)
        if cis_data:
            results.append({
                "player": cis_data["player"],
                "team": cis_data["team"],
                "total_innings": p["total_innings"],
                "cis_norm": cis_data["cis_norm"],
                "cis_raw_agg": cis_data["cis_raw_agg"],
                "choke_index": cis_data["choke_index"],
                "choke_high_pressure_innings": cis_data["choke_high_pressure_innings"],
            })
    results.sort(key=lambda x: -x["cis_norm"])
    return results[:top_k]


def get_clutch_leaderboard(gender: str = "Men", min_matches: int = 5, top_k: int = 100) -> list[dict]:
    """Leaderboard sorted by average match swing (WPA) per match."""
    placeholders = _get_placeholders()
    rows = query_all(
        f"""
        SELECT player, team, COUNT(*) as matches,
               SUM(batting_impact) as sum_batting,
               SUM(bowling_impact) as sum_bowling,
               SUM(batting_impact) + SUM(bowling_impact) as total_swing
        FROM player_match_impacts
        WHERE team IN ({placeholders}) AND gender = ?
        GROUP BY player
        HAVING COUNT(*) >= ?
        """,
        (*ALLOWED_TEAMS, gender, min_matches),
    )
    # Average swing per match (in fraction, e.g. 0.08 = +8%)
    results = []
    for r in rows:
        n = r["matches"]
        total = (r["total_swing"] or 0)
        avg_swing = total / n if n else 0
        results.append({
            "player": r["player"],
            "team": r["team"],
            "matches": n,
            "swing_sum_total": round(total, 4),
            "swing_avg_per_match": round(avg_swing, 4),
            "swing_percent": round(avg_swing * 100, 2),
        })
    results.sort(key=lambda x: -x["swing_avg_per_match"])
    return results[:top_k]
