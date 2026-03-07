"""
compute_impact_dataset.py — Compute player impact scores using win probability deltas.
For each ball: impact = win_prob_after - win_prob_before
Assigns impact to the striker (batting) and bowler (bowling).
Aggregates per-player per-match, computes rolling 10-innings, normalizes 0-100.
Writes everything to SQLite.
"""

import os
import sys
import sqlite3
import joblib
import numpy as np
import pandas as pd
from math import exp


def compute_win_prob_deltas(features_df: pd.DataFrame, model_bundle: dict) -> pd.DataFrame:
    """
    For each ball, compute win_prob_before and win_prob_after.
    Delta is attributed to striker (batting impact) and bowler (bowling impact).
    """
    model = model_bundle["model"]
    feature_cols = model_bundle["feature_cols"]

    df = features_df.copy()
    df = df.sort_values(["match_id", "innings", "ball"]).reset_index(drop=True)

    # Predict win probability for each ball state
    X = df[feature_cols].values
    win_probs = model.predict_proba(X)[:, 1]  # P(batting team wins)
    df["win_prob"] = win_probs

    # Compute delta: shift within each (match_id, innings) group
    results = []
    for (mid, inn), group in df.groupby(["match_id", "innings"]):
        g = group.copy().reset_index(drop=True)

        # Win prob before = previous ball's win prob (first ball uses 0.5)
        g["win_prob_before"] = g["win_prob"].shift(1, fill_value=0.5)
        g["win_prob_after"] = g["win_prob"]

        # For batting team: positive delta = good for batting team
        g["batting_impact"] = g["win_prob_after"] - g["win_prob_before"]

        # For bowling team: impact is negative of batting impact
        # (good bowling reduces batting team's win prob)
        g["bowling_impact"] = -g["batting_impact"]

        results.append(g)

    return pd.concat(results, ignore_index=True)


def aggregate_player_match_impact(deltas_df: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregate impact per player per match.
    - Batting impact: sum of batting_impact for balls where player was striker
    - Bowling impact: sum of bowling_impact for balls where player was bowler
    """
    # Batting impact per player per match
    batting = (
        deltas_df.groupby(["match_id", "striker", "batting_team", "start_date", "gender"])
        .agg(
            batting_impact=("batting_impact", "sum"),
            balls_faced=("batting_impact", "count"),
            runs_scored=("runs_off_bat", "sum"),
        )
        .reset_index()
        .rename(columns={"striker": "player", "batting_team": "team"})
    )

    # Bowling impact per player per match
    bowling = (
        deltas_df.groupby(["match_id", "bowler", "bowling_team", "start_date", "gender"])
        .agg(
            bowling_impact=("bowling_impact", "sum"),
            balls_bowled=("bowling_impact", "count"),
            wickets_taken=("is_wicket", "sum"),
            runs_conceded=("total_runs", "sum"),
        )
        .reset_index()
        .rename(columns={"bowler": "player", "bowling_team": "team"})
    )

    # Merge batting and bowling
    merged = pd.merge(
        batting,
        bowling,
        on=["match_id", "player", "team", "start_date", "gender"],
        how="outer",
    ).fillna(0)

    # Total match impact
    merged["match_impact"] = merged["batting_impact"] + merged["bowling_impact"]

    # Sort by date
    merged = merged.sort_values(["player", "start_date", "match_id"]).reset_index(drop=True)

    return merged


def compute_rolling_impact(player_impacts: pd.DataFrame, window: int = 10, decay: float = 0.15) -> pd.DataFrame:
    """
    Compute rolling last N innings impact with exponential decay weighting.
    weight = exp(-decay * innings_age), where innings_age = 0 for most recent.
    """
    results = []

    for player, group in player_impacts.groupby("player"):
        g = group.sort_values("start_date").reset_index(drop=True)

        rolling_scores = []
        for i in range(len(g)):
            # Take last `window` innings up to and including current
            start = max(0, i - window + 1)
            recent = g.iloc[start : i + 1].copy()

            # Compute weights (most recent = age 0)
            ages = np.arange(len(recent) - 1, -1, -1)
            weights = np.exp(-decay * ages)
            weights /= weights.sum()

            weighted_impact = (recent["match_impact"].values * weights).sum()
            rolling_scores.append(weighted_impact)

        g["rolling_impact"] = rolling_scores
        results.append(g)

    return pd.concat(results, ignore_index=True)


def normalize_impact(df: pd.DataFrame) -> pd.DataFrame:
    """
    Normalize rolling_impact to 0-100 scale.
    50 = league average. Uses z-score then maps to 0-100.
    """
    mean_impact = df["rolling_impact"].mean()
    std_impact = df["rolling_impact"].std()

    if std_impact == 0:
        df["impact_score"] = 50.0
    else:
        # Z-score
        z = (df["rolling_impact"] - mean_impact) / std_impact
        # Map to 0-100: mean=50, each std = ~16.67 points
        df["impact_score"] = (z * 16.67 + 50).clip(0, 100).round(2)

    return df


def get_latest_player_scores(df: pd.DataFrame) -> pd.DataFrame:
    """Get the most recent impact score per player."""
    latest = df.sort_values("start_date").groupby(["player", "gender"]).last().reset_index()
    return latest[["player", "team", "gender", "impact_score", "rolling_impact",
                    "batting_impact", "bowling_impact", "match_impact",
                    "runs_scored", "balls_faced", "wickets_taken",
                    "balls_bowled", "runs_conceded", "start_date", "match_id"]]


def save_to_sqlite(player_impacts: pd.DataFrame, latest_scores: pd.DataFrame, db_path: str):
    """Save computed data to SQLite."""
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)

    # Player match impacts
    player_impacts.to_sql("player_match_impacts", conn, if_exists="replace", index=False)

    # Latest scores (leaderboard)
    latest_scores.to_sql("player_scores", conn, if_exists="replace", index=False)

    # Create indices
    conn.execute("CREATE INDEX IF NOT EXISTS idx_pmi_player ON player_match_impacts(player)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_pmi_match ON player_match_impacts(match_id)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_ps_player ON player_scores(player)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_ps_score ON player_scores(impact_score DESC)")
    conn.commit()

    print(f"Saved {len(player_impacts)} player-match records and {len(latest_scores)} player scores to {db_path}")
    conn.close()


if __name__ == "__main__":
    sys.path.insert(0, os.path.dirname(__file__))
    from data_loader import load_all_matches
    from feature_builder import build_ball_features

    data_dir = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        os.path.dirname(__file__), "..", "data", "raw_matches"
    )
    model_path = os.path.join(
        os.path.dirname(__file__), "..", "backend", "models", "win_probability.pkl"
    )
    db_path = os.path.join(
        os.path.dirname(__file__), "..", "backend", "database", "sqlite.db"
    )

    print("=" * 60)
    print("STEP 1: Loading match data...")
    print("=" * 60)
    balls_df, match_info = load_all_matches(data_dir)

    print("\n" + "=" * 60)
    print("STEP 2: Building features...")
    print("=" * 60)
    features_df = build_ball_features(balls_df)

    print("\n" + "=" * 60)
    print("STEP 3: Loading trained model...")
    print("=" * 60)
    model_bundle = joblib.load(model_path)
    print(f"Loaded model with features: {model_bundle['feature_cols']}")

    print("\n" + "=" * 60)
    print("STEP 4: Computing win probability deltas...")
    print("=" * 60)
    deltas_df = compute_win_prob_deltas(features_df, model_bundle)

    print("\n" + "=" * 60)
    print("STEP 5: Aggregating player match impacts...")
    print("=" * 60)
    player_impacts = aggregate_player_match_impact(deltas_df)
    print(f"Total player-match records: {len(player_impacts)}")
    print(f"Unique players: {player_impacts['player'].nunique()}")

    print("\n" + "=" * 60)
    print("STEP 6: Computing rolling impact (last 10 innings)...")
    print("=" * 60)
    player_impacts = compute_rolling_impact(player_impacts)

    print("\n" + "=" * 60)
    print("STEP 7: Normalizing to 0-100 scale...")
    print("=" * 60)
    player_impacts = normalize_impact(player_impacts)

    print("\n" + "=" * 60)
    print("STEP 8: Saving to SQLite...")
    print("=" * 60)
    latest_scores = get_latest_player_scores(player_impacts)
    save_to_sqlite(player_impacts, latest_scores, db_path)

    # Print top 10 players
    print("\n" + "=" * 60)
    print("TOP 10 PLAYERS BY IMPACT SCORE")
    print("=" * 60)
    top = latest_scores.sort_values("impact_score", ascending=False).head(10)
    for i, row in top.iterrows():
        print(f"  {row['player']:25s} | Score: {row['impact_score']:6.2f} | Team: {row['team']}")
