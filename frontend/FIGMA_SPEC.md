# Figma / Design Spec — Cricket Impact (Neo-Brutalist)

This document describes the main screens for implementation or recreation in Figma. Use the exact tokens from `src/styles/tokens.css` and the 60/30/10 rule.

---

## 1. Player Dashboard

- **Canvas:** Full background `#EBEBEB` (60%).
- **Layout:** Max width 1400px, centered; gutter 24px.
- **Header:** H1 “Player Dashboard” (Sora/Inter 36px), subtitle 16px secondary. Right: search bar (pill, radius-lg, white fill, shadow-soft).
- **Hero block:** Large card (radius-lg, surface-card, shadow-strong). Left: **Impact Gauge** (circular, 200px, thick ring 18px in accent-strong, center number 48px; optional orange inner rim when score ≥80). Right: Player name (H2), team, gender pill (MEN/WOMEN, radius-pill), category pill (accent). Below: 3 small stat cards (Batting Component, Bowling Component, Total Innings).
- **Last N block:** Card with “Stats for Last N Games”, slider 1–10, grid of 6 metric cards (Innings, Runs, Strike Rate, Bat Average, Wickets, Economy). Numbers use accent or accent-strong.
- **Trend chart:** Large area chart, stroke accent-strong 3px, fill gradient 3A6EA5→transparent. Subtle or no gridlines.
- **Innings table:** Card with table: Date, Runs, Balls, Wkts, Bat Perf, Bowl Perf, Context, Pressure, Raw, IM. Rows with high pressure get 6px left stripe in #FF6700.
- **Career block:** Card with 6 stat cells.

---

## 2. Leaderboard

- **Canvas:** #EBEBEB.
- **Header:** H1 “{Gender}'s Leaderboard”, subtitle. No search in header (search in Topbar).
- **KPI row:** Three cards (Players analyzed, Matches, Average Impact). Same as KPIGrid: surface-card, radius-lg, main number 36px accent-strong.
- **Filters:** Pills right-aligned: All / Batters / Bowlers (active = accent fill), Min Innings dropdown.
- **Table:** Card container. Rows: Rank (medal for top 3), Player (name + gender icon + team), IM Score (36px accent-strong), Category pill, Innings, Runs, Wickets. Top 3 rows: alternating block accent strip, medal icon. Row hover: lift (translateY -6px) + shadow-strong. Tabular numerals for all numbers.

---

## 3. Match Explorer (list)

- **Canvas:** #EBEBEB.
- **Header:** H1 “{Gender}'s Match Explorer”, subtitle.
- **Match list:** Each match = long rounded card (radius-lg, surface-card). Left: “Team A vs Team B”, date; optional “Winner: X” badge (accent). Right: “Match ID”, value in accent-strong. Hover: card lift + shadow-strong.

---

## 4. Match Detail

- **Back:** Button “← Back” (surface-muted, radius-md).
- **Title:** “Match {id}”, date below.
- **Rosters:** One card per team. Header bar: team name (accent-strong, H3). Table: Player, Runs, Wkts, Bat Perf, Bowl Perf, Context, Pressure, Raw IM, IM Score, Category. Rows clickable; hover surface-muted.

---

## 5. Player Detail (same as Player Dashboard hero + stats)

- Reuse Player Dashboard layout: gauge left, name/team/gender/category right, then Last N stats grid, trend chart, innings table, career.

---

## Design assets (export from app or use as reference)

- **Impact Gauge:** SVG donut, r=45, stroke 18, color accent-strong; center text 48px. Optional inner orange ring for score ≥80.
- **Pressure Isotherm:** Blocky grid of rounded cells (e.g. 6px radius), fill from accent-strong opacity scale (e.g. 0.15 → 0.95). Axis labels: RRR, Wickets. Legend: pressure bins with numeric ranges.

Use these specs to build frames in Figma and keep components aligned with the codebase.
