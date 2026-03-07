import os
import sqlite3

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "database", "sqlite.db")

def rebuild():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    print("Dropping existing relevant indices...")
    c.execute("DROP INDEX IF EXISTS idx_player_scores_player")
    c.execute("DROP INDEX IF EXISTS idx_player_scores_team_gender")
    c.execute("DROP INDEX IF EXISTS idx_player_match_impacts_match")
    c.execute("DROP INDEX IF EXISTS idx_player_match_impacts_team_gender")

    print("Building player indices...")
    c.execute("CREATE INDEX idx_player_scores_player ON player_scores(player)")
    c.execute("CREATE INDEX idx_player_scores_team_gender ON player_scores(team, gender)")
    
    print("Building match indices...")
    c.execute("CREATE INDEX idx_player_match_impacts_match ON player_match_impacts(match_id)")
    c.execute("CREATE INDEX idx_player_match_impacts_team_gender ON player_match_impacts(team, gender)")

    conn.commit()
    conn.close()
    print("Indices rebuilt successfully")

if __name__ == "__main__":
    rebuild()
