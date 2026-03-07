"""
impact_calculator.py — Service for computing impact metrics at runtime.
"""

import joblib
import numpy as np
import os


MODEL_PATH = os.path.join(
    os.path.dirname(__file__), "..", "models", "win_probability.pkl"
)

_model_bundle = None


def get_model():
    """Lazy-load the trained model."""
    global _model_bundle
    if _model_bundle is None:
        _model_bundle = joblib.load(MODEL_PATH)
    return _model_bundle


def predict_win_probability(features: dict) -> float:
    """Predict win probability given a game state."""
    bundle = get_model()
    model = bundle["model"]
    feature_cols = bundle["feature_cols"]

    X = np.array([[features.get(col, 0) for col in feature_cols]])
    prob = model.predict_proba(X)[0][1]
    return float(prob)
