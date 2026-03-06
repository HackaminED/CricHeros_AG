"""
data_loader.py — Load all Cricsheet-style ball-by-ball CSVs and info CSVs.
Produces a unified DataFrame with match metadata merged in.
"""

import os
import glob
import pandas as pd
import re


def parse_info_file(info_path: str) -> dict:
    """Parse a Cricsheet _info.csv to extract match metadata."""
    meta = {
        "winner": None,
        "teams": [],
        "players": {},
        "season": None,
        "venue": None,
        "date": None,
        "event": None,
        "toss_winner": None,
        "toss_decision": None,
        "winner_runs": None,
        "winner_wickets": None,
    }
    with open(info_path, "r", encoding="utf-8") as f:
        for line in f:
            parts = [p.strip() for p in line.strip().split(",")]
            if len(parts) < 2:
                continue
            if parts[0] == "info":
                key = parts[1] if len(parts) > 1 else ""
                if key == "winner" and len(parts) > 2:
                    meta["winner"] = ",".join(parts[2:])
                elif key == "team" and len(parts) > 2:
                    meta["teams"].append(",".join(parts[2:]))
                elif key == "season" and len(parts) > 2:
                    meta["season"] = parts[2]
                elif key == "venue" and len(parts) > 2:
                    meta["venue"] = ",".join(parts[2:])
                elif key == "date" and len(parts) > 2:
                    meta["date"] = parts[2]
                elif key == "event" and len(parts) > 2:
                    meta["event"] = ",".join(parts[2:])
                elif key == "toss_winner" and len(parts) > 2:
                    meta["toss_winner"] = ",".join(parts[2:])
                elif key == "toss_decision" and len(parts) > 2:
                    meta["toss_decision"] = parts[2]
                elif key == "winner_runs" and len(parts) > 2:
                    meta["winner_runs"] = int(parts[2])
                elif key == "winner_wickets" and len(parts) > 2:
                    meta["winner_wickets"] = int(parts[2])
                elif key == "player" and len(parts) > 3:
                    team = ",".join(parts[2:-1])
                    player = parts[-1]
                    meta["players"].setdefault(team, []).append(player)
    return meta


def load_all_matches(data_dir: str) -> tuple[pd.DataFrame, dict]:
    """
    Load all match ball-by-ball CSVs and info files.

    Returns:
        balls_df: DataFrame with all ball events + match metadata
        match_info: dict of match_id -> parsed info metadata
    """
    # Find all ball CSVs (exclude _info.csv)
    ball_files = sorted(glob.glob(os.path.join(data_dir, "*.csv")))
    ball_files = [f for f in ball_files if "_info" not in os.path.basename(f)]

    all_dfs = []
    match_info = {}

    for bf in ball_files:
        match_id = os.path.basename(bf).replace(".csv", "")
        info_path = os.path.join(data_dir, f"{match_id}_info.csv")

        # Load ball data
        try:
            df = pd.read_csv(bf)
        except Exception as e:
            print(f"[WARN] Skipping {bf}: {e}")
            continue

        if df.empty:
            continue

        # Parse info
        meta = {}
        if os.path.exists(info_path):
            meta = parse_info_file(info_path)
            match_info[match_id] = meta

        # Add winner column
        if meta.get("winner"):
            df["winner"] = meta["winner"]
        else:
            df["winner"] = None

        # Ensure match_id is string
        df["match_id"] = str(match_id)

        all_dfs.append(df)

    if not all_dfs:
        raise ValueError(f"No match CSVs found in {data_dir}")

    balls_df = pd.concat(all_dfs, ignore_index=True)

    # Ensure numeric columns
    for col in ["runs_off_bat", "extras", "wides", "noballs", "byes", "legbyes", "penalty"]:
        if col in balls_df.columns:
            balls_df[col] = pd.to_numeric(balls_df[col], errors="coerce").fillna(0).astype(int)

    print(f"Loaded {len(ball_files)} matches, {len(balls_df)} ball events")
    return balls_df, match_info


if __name__ == "__main__":
    import sys

    data_dir = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        os.path.dirname(__file__), "..", "data", "raw_matches"
    )
    df, info = load_all_matches(data_dir)
    print(df.head())
    print(f"\nColumns: {list(df.columns)}")
    print(f"Unique matches: {df['match_id'].nunique()}")
