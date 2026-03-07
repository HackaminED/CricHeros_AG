"""
train_model.py — Train a Gradient Boosting classifier to predict win probability.
Target: team_won (binary — does the batting team win?)
Features: runs_so_far, balls_remaining, wickets_remaining,
          current_run_rate, required_run_rate, match_phase, pressure_score
"""

import os
import sys
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report


def train_win_probability_model(features_df: pd.DataFrame, model_path: str):
    """Train and save a win probability model."""

    feature_cols = [
        "runs_so_far",
        "balls_remaining",
        "wickets_remaining",
        "current_run_rate",
        "required_run_rate",
        "match_phase",
        "pressure_score",
        "innings",
    ]

    # Drop rows with nulls in features or target
    df = features_df.dropna(subset=feature_cols + ["team_won"]).copy()

    X = df[feature_cols].values
    y = df["team_won"].values.astype(int)

    print(f"Training data: {len(X)} samples, {X.shape[1]} features")
    print(f"Class distribution: {np.bincount(y)}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = GradientBoostingClassifier(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.1,
        subsample=0.8,
        random_state=42,
    )

    print("Training Gradient Boosting model...")
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\nTest Accuracy: {acc:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["Lost", "Won"]))

    # Feature importances
    print("\nFeature Importances:")
    for name, imp in sorted(
        zip(feature_cols, model.feature_importances_), key=lambda x: -x[1]
    ):
        print(f"  {name}: {imp:.4f}")

    # Save model
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    joblib.dump({"model": model, "feature_cols": feature_cols}, model_path)
    print(f"\nModel saved to {model_path}")

    return model, feature_cols


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

    print("=" * 60)
    print("STEP 1: Loading match data...")
    print("=" * 60)
    balls_df, match_info = load_all_matches(data_dir)

    print("\n" + "=" * 60)
    print("STEP 2: Building features...")
    print("=" * 60)
    features_df = build_ball_features(balls_df)

    print("\n" + "=" * 60)
    print("STEP 3: Training model...")
    print("=" * 60)
    train_win_probability_model(features_df, model_path)
