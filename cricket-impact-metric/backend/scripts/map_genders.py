import sqlite3
import json

def run():
    # As the prompt stated, we can create a mapping of some known women players
    # "AC Kerr", "Fatima Sana" were mentioned in the prompt, let's find others from DB or just tag these.
    
    conn = sqlite3.connect('backend/database/sqlite.db')
    c = conn.cursor()
    
    # Let's find some players manually from the DB that are likely Women
    women_players = [
        "AC Kerr", "Fatima Sana", "SW Bates", "SFM Devine", "A Healy", 
        "BL Mooney", "TM McGrath", "EA Perry", "S Mandhana", "H Kaur", 
        "MR Villani", "SJ Taylor", "L Wolvaardt", "M Kapp", "S Luus",
        "NR Sciver-Brunt", "D Wyatt", "S Ecclestone", "A Gardner",
        "HK Matthews", "M Lanning", "S Devine"
    ]
    
    print(f"Tagging {len(women_players)} known women players...")
    
    placeholders = ",".join(["?"] * len(women_players))
    
    # Update player_match_impacts
    c.execute(f"UPDATE player_match_impacts SET gender = 'Women' WHERE player IN ({placeholders})", women_players)
    matches_updated = c.rowcount
    print(f"Updated {matches_updated} rows in player_match_impacts.")
    
    # Update player_scores
    c.execute(f"UPDATE player_scores SET gender = 'Women' WHERE player IN ({placeholders})", women_players)
    scores_updated = c.rowcount
    print(f"Updated {scores_updated} rows in player_scores.")
    
    conn.commit()
    conn.close()

if __name__ == '__main__':
    run()
