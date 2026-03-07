import os
import json
import sqlite3

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "database", "sqlite.db")
MAP_PATH = os.path.join(BASE_DIR, "data", "player_gender_map.json")

def is_women_team(team_name):
    if not team_name: return False
    # Check if team name contains 'Women', 'W', 'Women's' etc
    # We'll just check for 'Women' or 'women' per specs:
    # "If team name contains: Women"
    return "women" in str(team_name).lower() or " w " in str(team_name).lower() or team_name.endswith(" W")

def reclassify():
    with open(MAP_PATH, "r") as f:
        player_gender_map = json.load(f)

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    # Get all matches and their teams
    c.execute("SELECT match_id, team FROM player_match_impacts GROUP BY match_id, team")
    match_teams = c.fetchall()
    
    match_gender = {}
    match_team_dict = {}
    for row in match_teams:
        mid = row["match_id"]
        t = row["team"]
        if mid not in match_team_dict:
            match_team_dict[mid] = []
        match_team_dict[mid].append(t)
        
    for mid, teams in match_team_dict.items():
        if len(teams) >= 2 and all(is_women_team(t) for t in teams):
            match_gender[mid] = "Women"
        elif all(not is_women_team(t) for t in teams):
            match_gender[mid] = "Men"
        else:
            match_gender[mid] = "Unknown"
    
    # 2. Update player_match_impacts
    c.execute("SELECT rowid, player, team, match_id FROM player_match_impacts")
    impact_rows = c.fetchall()
    
    update_impacts = []
    
    for row in impact_rows:
        rowid = row["rowid"]
        player = row["player"]
        team = row["team"]
        mid = row["match_id"]
        
        # Determine gender based on layers
        final_gender = "Unknown"
        
        # Layer 1
        if player in player_gender_map:
            final_gender = player_gender_map[player]
        # Layer 2
        elif is_women_team(team):
            final_gender = "Women"
        # Layer 3
        elif mid in match_gender and match_gender[mid] != "Unknown":
            final_gender = match_gender[mid]
        
        update_impacts.append((final_gender, rowid))
        
    c.executemany("UPDATE player_match_impacts SET gender = ? WHERE rowid = ?", update_impacts)
    
    # 3. Update player_scores
    c.execute("SELECT player, team FROM player_scores")
    score_rows = c.fetchall()
    
    update_scores = []
    for row in score_rows:
        player = row["player"]
        team = row["team"]
        
        final_gender = "Unknown"
        
        if player in player_gender_map:
            final_gender = player_gender_map[player]
        elif is_women_team(team):
            final_gender = "Women"
        else:
            # Check match_gender for this player's matches
            c.execute("SELECT match_id FROM player_match_impacts WHERE player = ?", (player,))
            player_mids = [r["match_id"] for r in c.fetchall()]
            
            # If all player's matches that have a known gender are Women, tag as Women
            known_match_genders = [match_gender[mid] for mid in player_mids if mid in match_gender and match_gender[mid] != "Unknown"]
            if known_match_genders:
                # Assign based on majority or just first
                if "Women" in known_match_genders and "Men" not in known_match_genders:
                    final_gender = "Women"
                elif "Men" in known_match_genders and "Women" not in known_match_genders:
                    final_gender = "Men"
            
        update_scores.append((final_gender, player))
        
    c.executemany("UPDATE player_scores SET gender = ? WHERE player = ?", update_scores)
    
    conn.commit()
    conn.close()
    print("Migration finished")

if __name__ == "__main__":
    reclassify()
