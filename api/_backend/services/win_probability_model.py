"""
win_probability_model.py — Service wrapper for win probability predictions.
"""

from api._backend.services.impact_calculator import predict_win_probability
from api._backend.services.feature_engineering import build_game_state


def get_win_probability(
    runs_so_far: int,
    balls_remaining: int,
    wickets_remaining: int,
    current_run_rate: float,
    required_run_rate: float,
    match_phase: int,
    innings: int,
) -> float:
    """Get win probability for a given game state."""
    state = build_game_state(
        runs_so_far, balls_remaining, wickets_remaining,
        current_run_rate, required_run_rate, match_phase, innings
    )
    return predict_win_probability(state)
