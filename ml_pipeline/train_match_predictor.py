"""
train_match_predictor.py — Train a Gradient Boosting classifier to predict match winners
based on pre-match conditions (venue, toss winner, toss decision, and teams).

Target: team1_win (binary — does team1 win the match?)
Features: team1, team2, venue, toss_winner, toss_decision, gender
"""

import os
import sys
import glob
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
from .data_loader import parse_info_file

def build_match_predictor_dataset(data_dir: str):
    """Parses all info files to build a dataset for match prediction."""
    info_files = glob.glob(os.path.join(data_dir, "*_info.csv"))
    
    records = []
    
    for info_path in info_files:
        try:
            meta = parse_info_file(info_path)
            
            # Need exactly 2 teams and a known winner
            if len(meta.get("teams", [])) != 2 or not meta.get("winner"):
                continue
                
            team1 = meta["teams"][0]
            team2 = meta["teams"][1]
            winner = meta["winner"]
            venue = meta.get("venue", "Unknown")
            toss_winner = meta.get("toss_winner", "Unknown")
            toss_decision = meta.get("toss_decision", "Unknown")
            gender = meta.get("gender", "Unknown").lower()
            
            # Target variable: 1 if team1 won, 0 if team2 won (or tie/no result handled implicitly by winner check)
            if winner == team1:
                team1_win = 1
            elif winner == team2:
                team1_win = 0
            else:
                continue # Drawn or No Result
                
            # Normalize gender to match UI
            gender_normalized = "Women" if "female" in gender or "woman" in gender else "Men"
            
            # For robustness, we will create symmetric records so the model doesn't overfit
            # to the arbitrary order of team1 vs team2
            records.append({
                "team1": team1,
                "team2": team2,
                "venue": venue,
                "toss_winner": toss_winner,
                "toss_decision": toss_decision,
                "gender": gender_normalized,
                "team1_win": team1_win
            })
            
            # Reverse symmetry 
            records.append({
                "team1": team2,
                "team2": team1,
                "venue": venue,
                "toss_winner": toss_winner,
                "toss_decision": toss_decision,
                "gender": gender_normalized,
                "team1_win": 1 - team1_win
            })

        except Exception as e:
            continue
            
    df = pd.DataFrame(records)
    print(f"Extracted {len(df)} match scenarios for training.")
    
    # Pre-compute historical win rates dynamically
    team_stats = {}
    for team in pd.concat([df["team1"], df["team2"]]).unique():
        matches_as_t1 = df[df["team1"] == team]
        matches_as_t2 = df[df["team2"] == team]
        
        # In our dataset symmetry:
        # T1 win = team1_win == 1
        # T2 win = team1_win == 0
        wins_as_t1 = matches_as_t1[matches_as_t1["team1_win"] == 1].shape[0]
        wins_as_t2 = matches_as_t2[matches_as_t2["team1_win"] == 0].shape[0]
        
        total_matches = len(matches_as_t1) + len(matches_as_t2)
        total_wins = wins_as_t1 + wins_as_t2
        
        win_rate = total_wins / max(1, total_matches)
        
        team_stats[team] = {
            "matches": total_matches // 2, # Account for symmetry
            "wins": total_wins // 2,
            "win_rate": round(win_rate, 4)
        }
        
    # Inject win rates & match counts into DataFrame
    df["team1_win_rate"] = df["team1"].map(lambda t: team_stats[t]["win_rate"])
    df["team2_win_rate"] = df["team2"].map(lambda t: team_stats[t]["win_rate"])
    df["team1_matches"] = df["team1"].map(lambda t: team_stats[t]["matches"])
    df["team2_matches"] = df["team2"].map(lambda t: team_stats[t]["matches"])
    
    # Calculate powerful differential features
    df["win_rate_diff"] = df["team1_win_rate"] - df["team2_win_rate"]
    df["match_count_diff"] = df["team1_matches"] - df["team2_matches"]
    
    return df, team_stats

def train_predictor_model(df: pd.DataFrame, team_stats: dict, model_path: str):
    """Trains the match predictor model and saves the pipeline."""
    
    # Feature engineering / Encoders
    categorical_cols = ["team1", "team2", "venue", "toss_winner", "toss_decision", "gender"]
    numerical_cols = ["team1_win_rate", "team2_win_rate", "team1_matches", "team2_matches", "win_rate_diff", "match_count_diff"]
    feature_cols = categorical_cols + numerical_cols
    
    df = df.dropna(subset=feature_cols + ["team1_win"]).copy()
    
    encoders = {}
    X_encoded = pd.DataFrame()
    
    for col in categorical_cols:
        le = LabelEncoder()
        if col in ["team1", "team2", "toss_winner"]:
            all_teams = pd.concat([df["team1"], df["team2"], df["toss_winner"]]).unique()
            le.fit(all_teams)
        else:
            le.fit(df[col].astype(str).unique())
            
        X_encoded[col] = le.transform(df[col].astype(str))
        encoders[col] = le
        
    for col in numerical_cols:
        X_encoded[col] = df[col]
        
    y = df["team1_win"].values.astype(int)
    X = X_encoded.values
    
    print(f"Training data: {len(X)} samples, {X.shape[1]} features")
    print(f"Class distribution (1=team1 wins, 0=team2 wins): {np.bincount(y)}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = GradientBoostingClassifier(
        n_estimators=150,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.8,
        random_state=42,
    )

    print("Training Match Predictor model...")
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\nTest Accuracy: {acc:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["Team 2 Wins", "Team 1 Wins"]))

    print("\nFeature Importances:")
    for name, imp in sorted(
        zip(feature_cols, model.feature_importances_), key=lambda x: -x[1]
    ):
        print(f"  {name}: {imp:.4f}")

    # Generate options payload for the frontend
    # This makes it easy to populate the dropdowns
    options = {
        "teams": sorted(pd.concat([df["team1"], df["team2"]]).unique().tolist()),
        "venues": sorted(df["venue"].unique().tolist()),
        "toss_decisions": sorted(df["toss_decision"].unique().tolist()),
        "genders": sorted(df["gender"].unique().tolist())
    }

    # Save artifact bundle
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    bundle = {
        "model": model, 
        "feature_cols": feature_cols,
        "categorical_cols": categorical_cols,
        "numerical_cols": numerical_cols,
        "encoders": encoders,
        "options": options,
        "team_stats": team_stats
    }
    joblib.dump(bundle, model_path)
    print(f"\nModel bundle saved to {model_path}")

    return model

if __name__ == "__main__":
    sys.path.insert(0, os.path.dirname(__file__))
    
    data_dir = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        os.path.dirname(__file__), "..", "data", "raw_matches"
    )
    model_path = os.path.join(
        os.path.dirname(__file__), "..", "backend", "models", "match_predictor.pkl"
    )

    print("=" * 60)
    print("STEP 1: Extracting Match Scenarios...")
    print("=" * 60)
    df, team_stats = build_match_predictor_dataset(data_dir)

    print("\n" + "=" * 60)
    print("STEP 2: Training Match Predictor Model...")
    print("=" * 60)
    train_predictor_model(df, team_stats, model_path)
