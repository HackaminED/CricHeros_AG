"""
feature_engineering.py — Feature computation service for runtime use.
"""


def get_match_phase(over: float) -> int:
    """0-6: powerplay (0), 7-15: middle (1), 16-20: death (2)"""
    if over < 6:
        return 0
    elif over < 15:
        return 1
    else:
        return 2


def compute_pressure_score(
    wickets_remaining: int,
    required_run_rate: float,
    balls_remaining: int,
) -> float:
    """Compute pressure score from game state."""
    return (
        (10 - wickets_remaining) / 10 * 0.3
        + min(required_run_rate, 36) / 36 * 0.4
        + (1 - balls_remaining / 120) * 0.3
    )


def build_game_state(
    runs_so_far: int,
    balls_remaining: int,
    wickets_remaining: int,
    current_run_rate: float,
    required_run_rate: float,
    match_phase: int,
    innings: int,
) -> dict:
    """Build a feature dict for model prediction."""
    pressure = compute_pressure_score(wickets_remaining, required_run_rate, balls_remaining)
    return {
        "runs_so_far": runs_so_far,
        "balls_remaining": balls_remaining,
        "wickets_remaining": wickets_remaining,
        "current_run_rate": current_run_rate,
        "required_run_rate": required_run_rate,
        "match_phase": match_phase,
        "pressure_score": pressure,
        "innings": innings,
    }
