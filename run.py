"""
קובץ הפעלה של WooCommerce Telegram Bot
"""

import sys
import os

# הוסף את התיקייה הנוכחית לנתיב החיפוש של Python
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# יבא את הפונקציה הראשית
from src.main import main

if __name__ == "__main__":
    # הפעל את הבוט
    main() 