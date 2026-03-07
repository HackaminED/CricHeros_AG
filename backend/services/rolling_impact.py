"""
rolling_impact.py — Service for computing rolling impact metrics.
"""

import numpy as np
from backend.database.db import query_all


def get_player_rolling_trend(player_name: str, window: int = 10) -> list[dict]:
    """
    Get the last N innings impact values for a player,
    ordered from oldest to newest.
    """
    rows = query_all(
        """
        SELECT match_id, start_date, batting_impact, bowling_impact,
               match_impact, impact_score, runs_scored, wickets_taken,
               balls_faced, balls_bowled, runs_conceded, team
        FROM player_match_impacts
        WHERE player = ?
        ORDER BY start_date DESC
        LIMIT ?
        """,
        (player_name, window),
    )
    # Return in chronological order
    return list(reversed(rows))


def get_player_career_stats(player_name: str) -> dict | None:
    """Get aggregated career stats for a player."""
    row = query_all(
        """
        SELECT
            player,
            team,
            COUNT(*) as total_matches,
            SUM(runs_scored) as total_runs,
            SUM(balls_faced) as total_balls_faced,
            SUM(wickets_taken) as total_wickets,
            SUM(balls_bowled) as total_balls_bowled,
            SUM(runs_conceded) as total_runs_conceded,
            AVG(match_impact) as avg_match_impact,
            AVG(batting_impact) as avg_batting_impact,
            AVG(bowling_impact) as avg_bowling_impact
        FROM player_match_impacts
        WHERE player = ?
        GROUP BY player
        """,
        (player_name,),
    )
    return row[0] if row else None
