# WooCommerce Telegram Bot

בוט טלגרם המאפשר ניהול חנות WooCommerce באמצעות AI.

## תכונות

- צפייה במוצרים, קטגוריות והזמנות בחנות
- יצירת, עדכון ומחיקת מוצרים
- ניהול הזמנות מתקדם
- ממשק משתמש נוח בטלגרם
- תמיכה בשפה טבעית באמצעות OpenAI
- שימוש ב-OpenAI Agents SDK לניהול יעיל של סוכני AI
- מנגנון מטמון לשיפור ביצועים
- זמני תגובה מהירים לשאלות נפוצות
- מנגנון זיהוי שאלות פשוטות ומתן תשובות מוכנות מראש
- תמיכה בסטרימינג לקבלת תשובות בזמן אמת
- זיכרון שיחה לשמירת היסטוריית השיחה והעברתה לסוכן ה-AI
- ניקוי אוטומטי של היסטוריית שיחה בתחילת צ'אט חדש
- תמיכה במסד נתונים PostgreSQL לשמירת נתונים לטווח ארוך

## דרישות מערכת

- Python 3.8 ומעלה
- חשבון WooCommerce עם מפתחות API
- חשבון OpenAI עם מפתח API
- בוט טלגרם (ניתן ליצור באמצעות [BotFather](https://t.me/botfather))
- PostgreSQL (אופציונלי, לשמירת נתונים לטווח ארוך)

## התקנה

1. שכפל את המאגר:

```bash
git clone https://github.com/Slava12233/Openai_woo_agent.git
cd Openai_woo_agent
```

2. צור סביבת פיתוח וירטואלית והתקן את התלויות:

```bash
python -m venv venv
venv\Scripts\activate  # בווינדוס
source venv/bin/activate  # בלינוקס/מק
pip install -r requirements.txt
```

3. צור קובץ `.env` עם המשתנים הבאים:

```
# OpenAI
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o

# WooCommerce
WOO_URL=https://your-store.com
WOO_CONSUMER_KEY=your_consumer_key
WOO_CONSUMER_SECRET=your_consumer_secret
WOO_API_VERSION=wc/v3

# Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Cache
CACHE_ENABLED=True
CACHE_EXPIRY=300

# Memory
MEMORY_ENABLED=True
MEMORY_MAX_MESSAGES=50
MEMORY_CONTEXT_LIMIT=10

# Database
DB_ENABLED=False
DB_HOST=localhost
DB_PORT=5432
DB_NAME=woo_bot_db
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10
DB_CLEANUP_INTERVAL=86400

# Debug
DEBUG=False
LOG_LEVEL=INFO
```

4. הגדרת מסד נתונים PostgreSQL (אופציונלי):

אם ברצונך להשתמש במסד נתונים PostgreSQL לשמירת נתונים לטווח ארוך, עליך:

```bash
# התקנת PostgreSQL בלינוקס
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# או בווינדוס, הורד והתקן מ:
# https://www.postgresql.org/download/windows/

# יצירת מסד נתונים
sudo -u postgres psql
postgres=# CREATE DATABASE woo_bot_db;
postgres=# CREATE USER woo_bot WITH PASSWORD 'your_password';
postgres=# GRANT ALL PRIVILEGES ON DATABASE woo_bot_db TO woo_bot;
postgres=# \q

# עדכון קובץ .env
# DB_ENABLED=True
# DB_USER=woo_bot
# DB_PASSWORD=your_password
```

## שימוש

הפעל את הבוט:

```bash
python run.py
```

## פקודות בבוט

- `/start` - התחל שיחה עם הבוט
- `/help` - הצג עזרה
- `/clear_cache` - נקה את המטמון
- `/reset` - אפס את השיחה
- `/history` - הצג את היסטוריית השיחה
- `/clear_history` - נקה את היסטוריית השיחה

## מבנה הפרויקט

```
.
├── src/
│   ├── __init__.py
│   ├── config.py
│   ├── main.py
│   ├── memory.py
│   ├── database/
│   │   ├── __init__.py
│   │   ├── connection.py
│   │   ├── models.py
│   │   ├── repository.py
│   │   └── scheduler.py
│   ├── woocommerce/
│   │   ├── __init__.py
│   │   ├── api.py
│   │   ├── cache.py
│   │   └── tools.py
│   ├── openai/
│   │   ├── __init__.py
│   │   └── agent.py
│   └── telegram/
│       ├── __init__.py
│       └── bot.py
├── run.py
├── requirements.txt
├── .env
├── .env.example
├── .cursorrules
└── README.md
```

## שיפורים אחרונים

### שימוש במסד נתונים לזיכרון ארוך טווח (שלב 12)
הוספנו תמיכה במסד נתונים PostgreSQL לשמירת נתונים לטווח ארוך:
- הוספת מודול `database` עם תמיכה מלאה ב-PostgreSQL
- יצירת טבלאות לשמירת היסטוריית שיחות, תשובות במטמון והעדפות משתמשים
- מימוש מנגנון לטעינה ושמירה של נתונים במסד הנתונים
- הוספת מנגנון ניקוי תקופתי של נתונים ישנים
- עדכון מודול הזיכרון לשימוש במסד הנתונים
- הוספת מתזמן משימות לניקוי תקופתי של מסד הנתונים

### ניקוי אוטומטי של היסטוריית שיחה (שלב 11)
הוספנו מנגנון לניקוי אוטומטי של היסטוריית השיחה בתחילת צ'אט חדש:
- בכל פעם שמשתמש מתחיל צ'אט חדש עם הבוט (באמצעות פקודת `/start`), היסטוריית השיחה הקודמת נמחקת אוטומטית
- הודעת הפתיחה עודכנה כדי לציין למשתמש שזוהי שיחה חדשה וההיסטוריה נמחקה
- המנגנון מבטיח פרטיות טובה יותר ומונע בלבול בין שיחות שונות

### הוספת זיכרון שיחה (שלב 10)
הפרויקט שודרג עם מנגנון זיכרון שיחה, המאפשר לבוט לזכור את היסטוריית השיחה ולהשתמש בה לספק תשובות עקביות ורלוונטיות יותר. במסגרת השדרוג:
- הוספנו מודול `memory.py` עם מחלקת `ConversationMemory` לניהול זיכרון שיחה
- הוספנו שמירת היסטוריית שיחה לפי מזהה משתמש
- הגבלנו את גודל היסטוריית השיחה למספר הודעות מוגדר
- הוספנו העברת היסטוריית השיחה לסוכן ה-AI בכל פנייה חדשה
- הוספנו פקודות `/history` ו-`/clear_history` לניהול היסטוריית השיחה

### שדרוג ל-OpenAI Agents SDK (שלב 6)
הפרויקט שודרג לשימוש ב-SDK של OpenAI Agents, המספק יכולות מתקדמות לניהול סוכני AI ומפשט את הקוד. במסגרת השדרוג:
- הוספנו את ספריית openai-agents לרשימת התלויות
- עדכנו את מודול OpenAI לשימוש ב-SDK החדש
- הסרנו קוד בוילרפלייט מיותר שה-SDK מטפל בו
- עדכנו את מודול הטלגרם להתאמה ל-SDK החדש

### שיפור זמני תגובה (שלב 7 ו-9)
- הוספת מנגנון לזיהוי שאלות פשוטות ומתן תשובות מוכנות מראש
- הוספת מנגנון זיהוי מילות מפתח לזיהוי שאלות כלליות
- יצירת מטמון (response_cache) לשמירת תשובות לשאלות שכבר נשאלו
- שיפור הלוגיקה לזיהוי וריאציות של שאלות
- הוספת תמיכה בסטרימינג לקבלת תשובות בזמן אמת
- עדכון הוראות הסוכן לתשובות קצרות ומהירות יותר
- הגדרת פרמטרים מיטביים למודל (temperature נמוך יותר)

### שיפור ביצועים (שלב 2)
- מנגנון מטמון יעיל לקריאות WooCommerce API
- מנגנון לריקון יזום של המטמון במקרים מסוימים
- הוספת לוגים לניטור יעילות המטמון

### תיקון בעיות בספריית OpenAI Agents (שלב 8)
במהלך הפיתוח נתקלנו במספר בעיות בשימוש בספריית OpenAI Agents בגרסה 0.0.4, ותיקנו אותן:
- הסרת פרמטר api_key מקונסטרקטור של Agent והגדרתו כמשתנה סביבה
- שימוש באובייקט ModelSettings במקום מילון רגיל
- הגדרה נכונה של כלים כפונקציות אסינכרוניות
- הוספת טיפול בשגיאות בתוך הכלים למניעת קריסת הסוכן
- הגדרת כל כלי כפונקציה נפרדת עם חתימה מפורשת וטיפוסים מדויקים

## תוכניות עתידיות

### שלב 13: למידה מפידבק משתמשים
- הוספת כפתורי פידבק להודעות הבוט (👍/👎)
- שמירת פידבק משתמשים במסד הנתונים
- שימוש בפידבק לשיפור תשובות עתידיות
- יצירת מנגנון דירוג תשובות על בסיס פידבק

### שלב 14: שימוש ב-Memory ב-OpenAI Agents SDK
- חקירת יכולות ה-Memory ב-SDK של OpenAI Agents
- שילוב מנגנון ה-Memory של ה-SDK בבוט
- התאמת הקוד הקיים לעבודה עם מנגנון ה-Memory

### שלב 15: למידה עצמית מתקדמת
- יצירת מנגנון לזיהוי דפוסים בשאלות משתמשים
- הוספת מנגנון אוטומטי להרחבת מילון התשובות המוכנות מראש
- יצירת מנגנון לזיהוי שאלות חדשות נפוצות
- הוספת יכולת לבוט ללמוד מטעויות קודמות

### שיפורים נוספים מתוכננים
- הוספת תמיכה בשליחת תמונות ומדיה אחרת
- הוספת תמיכה בהתראות על הזמנות חדשות
- הוספת תמיכה בניתוח נתונים ודוחות
- הוספת תמיכה בשפות נוספות

## לקחים שנלמדו בפיתוח

### עבודה עם מסד נתונים
- שימוש במסד נתונים מאפשר שמירת נתונים לטווח ארוך ושיתוף נתונים בין מופעים שונים של הבוט
- חשוב לטפל בשגיאות התחברות למסד הנתונים ולספק מנגנון גיבוי (fallback) במקרה של כשל
- שימוש ב-SQLAlchemy מפשט את העבודה עם מסד הנתונים ומאפשר החלפה קלה של סוג מסד הנתונים בעתיד
- מנגנון ניקוי תקופתי חשוב למניעת גידול לא מבוקר של מסד הנתונים
- שימוש במתזמן משימות מאפשר ביצוע פעולות תחזוקה ברקע מבלי להפריע לפעילות הבוט

### עבודה עם OpenAI Agents SDK
- בגרסה 0.0.4 של ספריית openai-agents, הפונקציות Runner.run ו-Runner.run_streamed מחזירות coroutine שצריך לעשות לו await, והתוצאה מכילה את השדה final_output ולא output
- בעת שימוש בפונקציה function_tool, יש לעטוף את הפונקציות הרגילות בפונקציות אסינכרוניות ולהגדיר את שם הפונקציה באמצעות __name__ במקום להשתמש בפרמטר name
- בעת הגדרת model_settings, יש להשתמש באובייקט ModelSettings ולא במילון רגיל
- יש להגדיר כל כלי כפונקציה נפרדת עם חתימה מפורשת הכוללת טיפוסים מדויקים לכל פרמטר
- יש להקפיד על טיפול בשגיאות בתוך הפונקציות כדי למנוע קריסה של הסוכן
- בגרסה 0.0.4 של ספריית openai-agents, הפונקציה Runner.run לא מקבלת פרמטר messages להעברת היסטוריית שיחה. במקום זאת, יש לשלב את היסטוריית השיחה בתוך ההודעה עצמה כטקסט.

### עבודה עם זיכרון שיחה
- שמירת היסטוריית שיחה מאפשרת לבוט לספק תשובות עקביות ורלוונטיות יותר
- חשוב להגביל את גודל היסטוריית השיחה כדי למנוע עומס על הסוכן
- העברת היסטוריית השיחה לסוכן ה-AI מאפשרת לו להבין את ההקשר של השיחה
- שימוש במבנה נתונים יעיל לשמירת היסטוריית השיחה חשוב לביצועים טובים
- ניקוי אוטומטי של היסטוריית השיחה בתחילת צ'אט חדש מבטיח פרטיות ומונע בלבול בין שיחות

## רישיון

MIT 