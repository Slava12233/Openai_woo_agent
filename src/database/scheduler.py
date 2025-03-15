"""
מודול לניהול משימות תקופתיות במסד הנתונים
"""

import logging
import threading
import time
from typing import Optional

from src.config import DB_ENABLED, DB_CLEANUP_INTERVAL
from src.database.repository import cleanup_database

# יצירת לוגר
logger = logging.getLogger(__name__)

# משתנה גלובלי לשמירת ה-thread של המתזמן
_scheduler_thread: Optional[threading.Thread] = None
_stop_event = threading.Event()


def _cleanup_task():
    """
    משימת ניקוי תקופתית שרצה ברקע
    """
    logger.info("מתזמן ניקוי מסד הנתונים התחיל לפעול")
    
    while not _stop_event.is_set():
        try:
            # ביצוע ניקוי מסד הנתונים
            conversations_deleted, cache_deleted = cleanup_database()
            
            if conversations_deleted > 0 or cache_deleted > 0:
                logger.info(f"ניקוי תקופתי הושלם: נמחקו {conversations_deleted} שיחות ו-{cache_deleted} רשומות מטמון")
            
            # המתנה עד לניקוי הבא
            # בדיקה כל 10 שניות אם צריך לעצור את ה-thread
            for _ in range(int(DB_CLEANUP_INTERVAL / 10)):
                if _stop_event.is_set():
                    break
                time.sleep(10)
        except Exception as e:
            logger.error(f"שגיאה במשימת ניקוי תקופתית: {str(e)}")
            # המתנה קצרה במקרה של שגיאה
            time.sleep(60)
    
    logger.info("מתזמן ניקוי מסד הנתונים הופסק")


def start_scheduler():
    """
    התחלת מתזמן משימות תקופתיות
    """
    global _scheduler_thread
    
    if not DB_ENABLED:
        logger.info("מסד הנתונים מושבת, דילוג על הפעלת מתזמן")
        return False
    
    if _scheduler_thread is not None and _scheduler_thread.is_alive():
        logger.warning("מתזמן כבר פעיל, דילוג על הפעלה נוספת")
        return False
    
    # איפוס אירוע העצירה
    _stop_event.clear()
    
    # יצירת והפעלת ה-thread
    _scheduler_thread = threading.Thread(target=_cleanup_task, daemon=True)
    _scheduler_thread.start()
    
    logger.info(f"מתזמן ניקוי מסד הנתונים הופעל (מרווח ניקוי: {DB_CLEANUP_INTERVAL} שניות)")
    return True


def stop_scheduler():
    """
    עצירת מתזמן משימות תקופתיות
    """
    global _scheduler_thread
    
    if _scheduler_thread is None or not _scheduler_thread.is_alive():
        logger.warning("מתזמן אינו פעיל, דילוג על עצירה")
        return False
    
    # סימון לעצירה
    _stop_event.set()
    
    # המתנה לסיום ה-thread (עד 5 שניות)
    _scheduler_thread.join(timeout=5)
    
    if _scheduler_thread.is_alive():
        logger.warning("מתזמן לא הסתיים בזמן הקצוב")
        return False
    
    _scheduler_thread = None
    logger.info("מתזמן ניקוי מסד הנתונים נעצר בהצלחה")
    return True 