import psycopg2
import os
from dotenv import load_dotenv

# טעינת משתני סביבה מקובץ .env
load_dotenv()

try:
    # התחברות למסד הנתונים
    conn = psycopg2.connect(
        dbname=os.getenv('DB_NAME', 'woo_bot_db'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', 'SSll456456!!'),
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432')
    )
    
    # יצירת cursor
    cur = conn.cursor()
    
    # הצגת היסטוריית השיחות
    cur.execute('SELECT id, user_id, role, content, timestamp FROM conversations ORDER BY timestamp')
    rows = cur.fetchall()
    
    for row in rows:
        print("\n--- הודעה ---")
        print(f"ID: {row[0]}")
        print(f"משתמש: {row[1]}")
        print(f"תפקיד: {row[2]}")
        print(f"תוכן: {row[3]}")
        print(f"זמן: {row[4]}")
    
    # סגירת החיבור
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"שגיאה: {str(e)}") 