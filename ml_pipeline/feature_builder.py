"""
feature_builder.py — Compute ball-level features for win probability model.
Features: runs_so_far, balls_remaining, wickets_fallen, current_run_rate,
           required_run_rate, match_phase, team_won (target).
"""

import pandas as pd
import numpy as np


def get_match_phase(over: float) -> int:
    """
    Map over number to match phase.
    0-6: powerplay (0), 7-15: middle (1), 16-20: death (2)
    """
    if over < 6:
        return 0  # powerplay
    elif over < 15:
        return 1  # middle
    else:
        return 2  # death


def compute_over_number(ball_col: pd.Series) -> pd.Series:
    """Convert ball notation (e.g., 3.4) to actual over number (0-indexed)."""
    return ball_col.apply(lambda b: int(float(b)))


def build_ball_features(balls_df: pd.DataFrame) -> pd.DataFrame:
    """
    Build per-ball features for each delivery in the dataset.

    Args:
        balls_df: DataFrame with columns from the raw CSVs + winner column

    Returns:
        DataFrame with added feature columns
    """
    df = balls_df.copy()

    # Sort by match, innings, ball
    df = df.sort_values(["match_id", "innings", "ball"]).reset_index(drop=True)

    # Total runs per ball (bat + extras)
    df["total_runs"] = df["runs_off_bat"] + df["extras"]

    # Is wicket
    df["is_wicket"] = df["player_dismissed"].notna().astype(int)

    # Over number from ball notation
    df["over_num"] = compute_over_number(df["ball"])

    # Match phase
    df["match_phase"] = df["over_num"].apply(get_match_phase)

    # --- Compute cumulative features per match per innings ---
    features = []

    for (mid, inn), group in df.groupby(["match_id", "innings"]):
        g = group.copy()
        g = g.sort_values("ball").reset_index(drop=True)

        # Cumulative runs
        g["runs_so_far"] = g["total_runs"].cumsum()

        # Cumulative wickets
        g["wickets_fallen"] = g["is_wicket"].cumsum()

        # Ball count (excluding wides/no-balls for legal deliveries)
        # In Cricsheet, wides don't count as legal deliveries
        g["is_legal"] = ((g.get("wides", pd.Series(0, index=g.index)) == 0)).astype(int)
        g["legal_balls_bowled"] = g["is_legal"].cumsum()

        # T20: 120 balls per innings
        total_balls = 120
        g["balls_remaining"] = (total_balls - g["legal_balls_bowled"]).clip(lower=0)

        # Current run rate
        g["current_run_rate"] = np.where(
            g["legal_balls_bowled"] > 0,
            g["runs_so_far"] * 6.0 / g["legal_balls_bowled"],
            0.0,
        )

        # Required run rate (only for innings 2)
        if inn == 2:
            # Get innings 1 total from same match
            inn1 = df[(df["match_id"] == mid) & (df["innings"] == 1)]
            if not inn1.empty:
                target = inn1["total_runs"].sum() + 1  # Need to exceed
                g["target"] = target
                g["runs_needed"] = target - g["runs_so_far"]
                g["required_run_rate"] = np.where(
                    g["balls_remaining"] > 0,
                    g["runs_needed"] * 6.0 / g["balls_remaining"],
                    0.0,
                )
            else:
                g["target"] = 0
                g["runs_needed"] = 0
                g["required_run_rate"] = 0.0
        else:
            g["target"] = 0
            g["runs_needed"] = 0
            g["required_run_rate"] = 0.0

        # Wickets remaining (out of 10)
        g["wickets_remaining"] = 10 - g["wickets_fallen"]

        # Team won (batting team wins)
        g["team_won"] = (g["batting_team"] == g["winner"]).astype(int)

        features.append(g)

    result = pd.concat(features, ignore_index=True)

    # Pressure score: composite metric
    # Higher when: wickets remaining is low, RRR is high, balls remaining is low
    result["pressure_score"] = (
        (10 - result["wickets_remaining"]) / 10 * 0.3
        + result["required_run_rate"].clip(0, 36) / 36 * 0.4
        + (1 - result["balls_remaining"] / 120) * 0.3
    )

    print(f"Built features for {result['match_id'].nunique()} matches, {len(result)} balls")
    return result


if __name__ == "__main__":
    import sys, os

    sys.path.insert(0, os.path.dirname(__file__))
    from data_loader import load_all_matches

    data_dir = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        os.path.dirname(__file__), "..", "data", "raw_matches"
    )
    df, info = load_all_matches(data_dir)
    features = build_ball_features(df)
    print(features[["match_id", "innings", "ball", "runs_so_far", "wickets_fallen",
                     "balls_remaining", "current_run_rate", "required_run_rate",
                     "match_phase", "pressure_score", "team_won"]].head(20))
