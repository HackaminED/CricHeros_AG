# HackaminED Impact Metric (IM) Challenge

## Problem Statement

In cricket, average and strike rate indicate how much and how fast a player scores. However, the sport lacks a unified metric that quantifies how much a player truly influences the outcome of a match.

**Your challenge is to design an Impact Metric (IM) that measures the influence a player creates in every match.**

Impact is not just about raw performance (runs, wickets, eco etc.). The most meaningful impact often emerges under pressure.

**Impact = Performance × Match Context × Game Situation**

Where:

- **Performance** = measurable output (runs, wickets, economy, etc.)
- **Match Context** = state of the game (wickets fallen, required run rate, phase of innings, opposition quality, etc.)
- **Situation** = pressure intensity, match importance and previous out of form phase

The final impact metric needs to be aggregated on a rolling last 10 innings of individual players and visualized on a meter.

## Metric Requirements

- Normalized on a 0–100 scale
- 50 represents a neutral baseline
- Calculated on a rolling last 10 innings
- Updated after every match (not real-time)
- Recency must influence the score

> **Note**: You may use the above base framework — but innovation is strongly encouraged.

## Objective

This is not about creating a rule-based scoring system. It is about designing a:

- Robust
- Data-driven
- Context-aware
- Scalable
- Non-gameable metric

**End Goal**: When the game gets tough… how impactful is this player? We are looking for cricket intelligence translated into data science.

## Frontend Implementation

This repository contains the Next.js frontend to visualize the conceptualized Impact Metric. It features a robust, data-driven dashboard that aggregates mock impact values and displays them intuitively via an Impact Meter and historical trend lines.
