# WooCommerce AI Manager

מערכת חכמה לניהול חנות WooCommerce באמצעות AI.

## מבנה הפרויקט

הפרויקט מורכב משני חלקים עיקריים:

1. **Backend (src/)** - סוכן AI המתקשר עם WooCommerce API ומספק ממשק לניהול החנות.
2. **Frontend (frontend/)** - ממשק משתמש גרפי לניהול החנות, בנוי עם Next.js ו-Tailwind CSS.

## התקנה והרצה

### Backend

1. התקן את התלויות:
```bash
pip install -r requirements.txt
```

2. הגדר את משתני הסביבה בקובץ `.env`:
```
OPENAI_API_KEY=your_openai_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
WOO_CONSUMER_KEY=your_woocommerce_consumer_key
WOO_CONSUMER_SECRET=your_woocommerce_consumer_secret
WOO_STORE_URL=your_woocommerce_store_url
```

3. הרץ את הבוט:
```bash
python main.py
```

### Frontend

1. התקן את התלויות:
```bash
cd frontend
npm install
```

2. הרץ את הפרויקט בסביבת פיתוח:
```bash
npm run dev
```

3. פתח את הדפדפן בכתובת [http://localhost:3000](http://localhost:3000).

## תכונות

- **ניהול מוצרים** - הוספה, עריכה ומחיקה של מוצרים.
- **ניהול הזמנות** - צפייה בהזמנות, עדכון סטטוס ושליחת הודעות ללקוחות.
- **ניתוח נתונים** - צפייה בנתונים סטטיסטיים על המכירות והמוצרים.
- **בוט טלגרם** - ניהול החנות באמצעות בוט טלגרם חכם.
- **ממשק משתמש גרפי** - ממשק משתמש נוח ואינטואיטיבי לניהול החנות.

## טכנולוגיות

- **Backend**: Python, OpenAI API, Telegram Bot API, WooCommerce API
- **Frontend**: Next.js, React, Tailwind CSS
- **Database**: PostgreSQL

## רישיון

פרויקט זה מופץ תחת רישיון MIT. ראה קובץ `LICENSE` לפרטים נוספים. 