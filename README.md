# 🏏 Cricket Player Impact Metric

A complete end-to-end system for computing cricket player impact scores using win probability deltas from ball-by-ball match data.

**Impact = Win Probability After − Win Probability Before**

## Architecture

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  CSV Match   │───▶│  ML Pipeline │───▶│   SQLite DB  │
│    Data      │    │  (Sklearn)   │    │              │
└──────────────┘    └──────────────┘    └──────┬───────┘
                                               │
                                        ┌──────▼───────┐
                                        │   FastAPI     │
                                        │   Backend     │
                                        └──────┬───────┘
                                               │
                                        ┌──────▼───────┐
                                        │    React      │
                                        │  Dashboard    │
                                        └──────────────┘
```

## Quick Start

### 1. Install Python dependencies

```bash
cd cricket-impact-metric
pip install -r requirements.txt
```

### 2. Train the ML model

```bash
python -m ml_pipeline.train_model
```

### 3. Compute impact scores

```bash
python -m ml_pipeline.compute_impact_dataset
```

### 4. Start the backend

```bash
python -m uvicorn backend.app:app --reload --port 8000
```

### 5. Install and start the frontend

```bash
cd frontend
npm install
npm run dev
```

Visit **http://localhost:5173** to use the dashboard.

## How It Works

### Win Probability Model
A Gradient Boosting classifier trained on ball-level features:
- `runs_so_far`, `balls_remaining`, `wickets_remaining`
- `current_run_rate`, `required_run_rate`
- `match_phase` (powerplay / middle / death)
- `pressure_score`

### Impact Calculation
For each ball: `impact = win_prob_after − win_prob_before`
- Batting impact: assigned to the striker
- Bowling impact: assigned to the bowler (negative of batting impact)

### Rolling Impact Metric
- Last 10 innings with exponential decay: `weight = exp(-0.15 × age)`
- Normalized to 0–100 scale (50 = league average)

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /players` | List/search players |
| `GET /players/{name}/impact` | Player impact score + stats |
| `GET /players/{name}/trend` | Last N innings trend |
| `GET /players/{name}/predict?opponent=India` | Predicted impact vs opponent (same/other venue when venue data exists) |
| `GET /players/{name}/predict/history` | Innings with inferred opponent per match |
| `GET /players/{name}/predict/matchup?role=batter&against_type=spin` | Predicted impact vs bowler/batsman type |
| `GET /players/predict/matchup-types` | Available role and against_type options |
| `GET /leaderboard` | Top 50 by impact |
| `GET /matches` | List matches |
| `GET /matches/{id}` | Match impact breakdown |
| `GET /stats` | Global statistics |

### Predictions (opponent, venue, matchup)

- **Vs opponent**: Uses historical impact in matches vs that team (recency-weighted). Opponent is inferred from the other team in each match. Optional `venue` and `same_venue` support same-stadium vs other-stadium once venue is stored per match.
- **Matchup (batsman vs bowler type / bowler vs batsman type)**: Uses heuristic modifiers on baseline impact until delivery-level or type-aggregated data is available. Types: for batters `pace`, `spin`, `aggressive_bowler`, `defensive_bowler`; for bowlers `aggressive_batsman`, `accumulator`, etc. For production-grade matchup predictions, ball-by-ball (batsman–bowler) or pre-aggregated “vs type” stats are required.

## Tech Stack

- **ML**: Python, Pandas, Scikit-learn (Gradient Boosting)
- **Backend**: FastAPI, SQLite
- **Frontend**: React, Vite, Tailwind CSS, Recharts
