import os, joblib

model_path = os.path.join(
    os.path.dirname(__file__), "..", "backend", "models", "match_predictor.pkl"
)

if os.path.exists(model_path):
    bundle = joblib.load(model_path)
    team_stats = bundle.get("team_stats", {})
    
    import math
    for team, stats in team_stats.items():
        matches = stats['matches']
        win_rate = stats['win_rate']
        power_index = win_rate * math.log10(matches + 1) if matches > 0 else 0
        stats['power_index'] = round(power_index, 3)
        
    s = sorted(team_stats.items(), key=lambda x: -x[1]['power_index'])
    
    print("TOP 15:")
    for k, v in s[:15]:
        print(f"{k}: Matches={v['matches']}, WinRate={v['win_rate']}, Power={v['power_index']}")
        
    print("\nBOTTOM 15:")
    for k, v in s[-15:]:
        print(f"{k}: Matches={v['matches']}, WinRate={v['win_rate']}, Power={v['power_index']}")

    print("\nSELECTED:")
    for t in ['India', 'Australia', 'Bahrain', 'Austria', 'Canada']:
        if t in team_stats:
            v = team_stats[t]
            print(f"{t}: Matches={v['matches']}, WinRate={v['win_rate']}, Power={v['power_index']}")

