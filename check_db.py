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
    
    # בדיקת מספר הרשומות בטבלת cached_responses
    cur.execute('SELECT COUNT(*) FROM cached_responses')
    count = cur.fetchone()[0]
    print(f"מספר הרשומות בטבלת cached_responses: {count}")
    
    # אם יש רשומות, הצג אותן
    if count > 0:
        cur.execute('SELECT query_hash, query, response, created_at, last_accessed, access_count FROM cached_responses')
        rows = cur.fetchall()
        for row in rows:
            print("\n--- רשומה ---")
            print(f"שאילתה: {row[1]}")
            print(f"תשובה: {row[2]}")
            print(f"נוצר ב: {row[3]}")
            print(f"גישה אחרונה: {row[4]}")
            print(f"מספר גישות: {row[5]}")
    
    # בדיקת מספר הרשומות בטבלת conversations
    cur.execute('SELECT COUNT(*) FROM conversations')
    count = cur.fetchone()[0]
    print(f"\nמספר הרשומות בטבלת conversations: {count}")
    
    # בדיקת מספר הרשומות בטבלת user_preferences
    cur.execute('SELECT COUNT(*) FROM user_preferences')
    count = cur.fetchone()[0]
    print(f"מספר הרשומות בטבלת user_preferences: {count}")
    
    # סגירת החיבור
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"שגיאה: {str(e)}") 