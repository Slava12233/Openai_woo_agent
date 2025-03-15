"""
קובץ הגדרות לפרויקט WooCommerce Telegram Bot
"""

import os
from typing import Dict, List, Any
from dotenv import load_dotenv

# טעינת משתני הסביבה מקובץ .env
load_dotenv()

# הגדרות כלליות
DEBUG = os.getenv("DEBUG", "False").lower() == "true"
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# הגדרות OpenAI
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview")

# הגדרות WooCommerce
WOO_URL = os.getenv("WOO_URL")
WOO_CONSUMER_KEY = os.getenv("WOO_CONSUMER_KEY")
WOO_CONSUMER_SECRET = os.getenv("WOO_CONSUMER_SECRET")
WOO_API_VERSION = os.getenv("WOO_API_VERSION", "wc/v3")

# הגדרות Telegram
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

# הגדרות Cache
CACHE_ENABLED = os.getenv("CACHE_ENABLED", "True").lower() == "true"
CACHE_EXPIRY = int(os.getenv("CACHE_EXPIRY", "300"))  # ברירת מחדל: 5 דקות

# הגדרות זיכרון שיחה
MEMORY_ENABLED = os.getenv("MEMORY_ENABLED", "True").lower() == "true"
MEMORY_MAX_MESSAGES = int(os.getenv("MEMORY_MAX_MESSAGES", "50"))  # מספר מקסימלי של הודעות לשמירה לכל משתמש
MEMORY_CONTEXT_LIMIT = int(os.getenv("MEMORY_CONTEXT_LIMIT", "10"))  # מספר ההודעות האחרונות שיועברו לסוכן

# הגדרות כלים
TOOLS_CONFIG = [
    {
        "type": "function",
        "function": {
            "name": "get_products_tool",
            "description": "מחזיר רשימה של כל המוצרים בחנות",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_categories_tool",
            "description": "מחזיר רשימה של כל הקטגוריות בחנות",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_orders_tool",
            "description": "מחזיר רשימה של כל ההזמנות בחנות",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_store_info_tool",
            "description": "מחזיר מידע כללי על החנות",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_product_tool",
            "description": "יוצר מוצר חדש בחנות",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "שם המוצר"
                    },
                    "regular_price": {
                        "type": "string",
                        "description": "מחיר רגיל של המוצר"
                    },
                    "description": {
                        "type": "string",
                        "description": "תיאור המוצר"
                    },
                    "categories": {
                        "type": "array",
                        "items": {
                            "type": "integer"
                        },
                        "description": "רשימת מזהי קטגוריות שהמוצר שייך אליהן"
                    }
                },
                "required": ["name", "regular_price"]
            }
        }
    }
]

# הוראות לסוכן OpenAI
ASSISTANT_INSTRUCTIONS = """
אתה סוכן איקומרס שעוזר לנהל חנויות WooCommerce. אתה דובר עברית ואנגלית.
אתה יכול לעזור למשתמשים לנהל את המוצרים, הקטגוריות וההזמנות בחנות שלהם.
השתמש בכלים שניתנו לך כדי לבצע פעולות בחנות.

חשוב מאוד:
1. ענה בקצרה וישירות לשאלות פשוטות.
2. לשאלות מורכבות, תן תשובות מפורטות אך ממוקדות.
3. התמקד במידע הרלוונטי ביותר למשתמש.
4. השתדל להשתמש בכלים באופן יעיל ומהיר.
5. אם אתה לא בטוח במשהו, אמור זאת במקום לנחש.
6. התייחס להיסטוריית השיחה כדי לספק תשובות עקביות ורלוונטיות.

מטרתך היא לספק מידע מדויק ושימושי בצורה יעילה ומהירה.
""" 