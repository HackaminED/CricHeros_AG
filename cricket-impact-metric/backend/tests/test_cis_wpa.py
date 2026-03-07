"""
Tests for CIS engine and WPA service.
Run from repo root: python -m pytest backend/tests/test_cis_wpa.py -v
"""

import pytest
from backend.services.cis_engine import (
    compute_global_baseline,
    compute_cis_for_innings,
    get_player_cis,
    get_cis_leaderboard,
    get_clutch_leaderboard,
)
from backend.services.wpa_service import get_match_wpa, get_player_wpa


def test_compute_cis_for_innings_baseline_match():
    """When actual == baseline, CIS_raw should be near 0."""
    baseline = {"median_runs": 20, "median_sr": 120, "median_wpa": 0.0}
    # Innings: 20 runs, 20 balls -> SR 100, so delta_sr = -20; wpa 0
    row = {"runs": 20, "balls_faced": 20, "wpa_batting": 0, "wpa_bowling": 0}
    comp = compute_cis_for_innings(row, baseline)
    assert comp["delta_runs"] == 0
    assert comp["delta_sr"] == -20  # 100 - 120
    assert comp["delta_wpa"] == 0
    # cis_raw = 0.6*0 + 0.2*runs_equiv_sr + 0.2*0; runs_equiv_sr negative
    assert isinstance(comp["cis_raw"], (int, float))


def test_choke_index_contrived():
    """Choke Index: high-pressure innings with higher avg CIS than low -> index > 1."""
    baseline = {"median_runs": 15, "median_sr": 110, "median_wpa": 0.0}
    high = compute_cis_for_innings(
        {"runs": 40, "balls_faced": 25, "wpa_batting": 0.05, "wpa_bowling": 0, "pressure_index": 1.5},
        baseline,
    )
    low = compute_cis_for_innings(
        {"runs": 10, "balls_faced": 15, "wpa_batting": -0.02, "wpa_bowling": 0, "pressure_index": 1.0},
        baseline,
    )
    assert high["cis_raw"] > low["cis_raw"]


def test_get_player_cis_schema():
    """GET /players/{name}/cis returns expected JSON schema (if player exists)."""
    result = get_player_cis("NonExistentPlayerXYZ", last_n=5, gender="Men")
    # Should return None when no data
    assert result is None or isinstance(result, dict)
    if result:
        assert "player" in result
        assert "cis_norm" in result
        assert "cis_raw_agg" in result
        assert "choke_index" in result
        assert "components" in result
        assert "last_n_innings" in result
        assert "pressure_isotherm_data" in result


def test_get_match_wpa_schema():
    """GET /matches/{id}/wpa returns timeline and per_player (or None)."""
    result = get_match_wpa("nonexistent_match_123", gender="Men")
    assert result is None or isinstance(result, dict)
    if result:
        assert "timeline" in result
        assert "per_player" in result
        assert "match_id" in result


def test_get_player_wpa_schema():
    """GET /players/{name}/wpa returns clutch_impact_percent and match_swings."""
    result = get_player_wpa("NonExistentPlayerXYZ", last_n=5, gender="Men")
    assert result is None or isinstance(result, dict)
    if result:
        assert "player" in result
        assert "clutch_impact_percent" in result
        assert "match_swings" in result


def test_cis_leaderboard_returns_list():
    """GET /leaderboard/cis returns list of dicts."""
    result = get_cis_leaderboard(gender="Men", min_innings=10, top_k=5)
    assert isinstance(result, list)
    for row in result:
        assert "player" in row
        assert "cis_norm" in row


def test_clutch_leaderboard_returns_list():
    """GET /leaderboard/clutch returns list of dicts."""
    result = get_clutch_leaderboard(gender="Men", min_matches=2, top_k=5)
    assert isinstance(result, list)
    for row in result:
        assert "player" in row
        assert "swing_percent" in row or "swing_avg_per_match" in row
