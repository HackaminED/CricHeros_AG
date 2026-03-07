import pytest
from api._backend.services.impact_engine import (
    _batting_performance,
    _bowling_performance,
    _context_weight_for_over,
    _estimate_context_weight,
    _pressure_index,
    _categorize,
    _compute_innings_impact,
)

def test_batting_performance():
    # 50 runs off 25 balls = 200 SR, 5 fours(20), 2 sixes(12) = 32 boundary score
    # 5 dot balls = -2.5 penalty
    # 50*0.5(25) + 200*0.2(40) + 32*0.2(6.4) + 5*-0.5*0.1(-0.25)
    # 25 + 40 + 6.4 - 0.25 = 71.15
    score = _batting_performance(50, 25, fours=5, sixes=2, dot_balls=5)
    assert round(score, 2) == 71.15
    
    # 0 balls faced
    assert _batting_performance(0, 0) == 0.0

def test_bowling_performance():
    # 2 wickets (25*2*0.6=30)
    # 4 overs, 24 runs = 6.0 econ. (8-6)*5*0.3 = 3
    # 10 dot balls (10*0.1=1)
    # Total = 34.0
    score = _bowling_performance(2, 4.0, 24, dot_balls=10)
    assert round(score, 2) == 34.0

    # 0 overs bowled
    assert _bowling_performance(0, 0, 0) == 0.0

def test_context_weight_for_over():
    assert _context_weight_for_over(1) == 1.2
    assert _context_weight_for_over(6) == 1.2
    assert _context_weight_for_over(7) == 1.0
    assert _context_weight_for_over(15) == 1.0
    assert _context_weight_for_over(16) == 1.4
    assert _context_weight_for_over(20) == 1.4

def test_estimate_context_weight():
    # High involvement across phases
    assert _estimate_context_weight(30, 24) == 1.05
    # Medium involvement
    assert _estimate_context_weight(10, 12) == 1.15
    # Low involvement (death specialist)
    assert _estimate_context_weight(2, 6) == 1.3
    # No involvement
    assert _estimate_context_weight(0, 0) == 1.0

def test_pressure_index():
    # Base is 1.05. Strong positive bat impact (+0.1) adds 0.5 (capped at 0.8) -> 1.55
    res = _pressure_index(batting_impact=0.1, bowling_impact=0, runs_scored=50, wickets_taken=0, balls_faced=20, balls_bowled=0)
    assert round(res, 2) == 1.55
    
    # Negative bat impact (< -0.03) -> adds 0.1 -> 1.15
    res2 = _pressure_index(batting_impact=-0.05, bowling_impact=0, runs_scored=5, wickets_taken=0, balls_faced=10, balls_bowled=0)
    assert round(res2, 2) == 1.15
    
    # Death-over bowling with wickets (>= 2 wkts, bowl impact > 0.03) adds 0.3 -> 1.35
    res3 = _pressure_index(batting_impact=0, bowling_impact=0.05, runs_scored=0, wickets_taken=2, balls_faced=0, balls_bowled=24)
    assert round(res3, 2) == 1.35

def test_categorize():
    assert _categorize(90) == "Match Winner"
    assert _categorize(80) == "Match Winner"
    assert _categorize(79.9) == "High Impact"
    assert _categorize(60) == "High Impact"
    assert _categorize(40) == "Neutral"
    assert _categorize(20) == "Low Impact"
    assert _categorize(19.9) == "Poor Impact"
    assert _categorize(0) == "Poor Impact"
    assert _categorize(None) == "Unknown"

def test_compute_innings_impact():
    row = {
        "runs_scored": 30,
        "balls_faced": 15,
        "wickets_taken": 1,
        "balls_bowled": 12, # 2 overs
        "runs_conceded": 10,
        "batting_impact": 0.02,
        "bowling_impact": 0.01
    }
    
    res = _compute_innings_impact(row)
    
    assert "performance_score" in res
    assert "context_weight" in res
    assert "pressure_index" in res
    assert "raw_impact" in res
    
    # Check layer compositions
    assert res["performance_score"] == res["batting_performance"] + res["bowling_performance"]
    
    # Ctx weight for 27 balls involved is 1.15
    assert res["context_weight"] == 1.15
    
    # Pressure: nothing extraordinary, base 1.05
    assert res["pressure_index"] == 1.05
    
    # Raw = Perf * 1.15 * 1.05
    expected_raw = round(res["performance_score"] * 1.15 * 1.05, 2)
    assert res["raw_impact"] == expected_raw
