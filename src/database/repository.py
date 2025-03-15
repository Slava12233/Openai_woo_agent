"""
מודול לניהול פעולות מול מסד הנתונים
"""

import hashlib
import logging
import datetime
from typing import List, Dict, Any, Optional, Tuple

from src.config import DB_ENABLED, MEMORY_MAX_MESSAGES
from src.database.connection import get_session
from src.database.models import Conversation, CachedResponse, UserPreference

# יצירת לוגר
logger = logging.getLogger(__name__)


def save_conversation_message(user_id: str, message_id: str, role: str, content: str) -> bool:
    """
    שמירת הודעת שיחה במסד הנתונים
    
    Args:
        user_id: מזהה המשתמש
        message_id: מזהה ההודעה
        role: תפקיד השולח ('user' או 'assistant')
        content: תוכן ההודעה
        
    Returns:
        bool: האם השמירה הצליחה
    """
    if not DB_ENABLED:
        logger.debug("מסד הנתונים מושבת, דילוג על שמירת הודעת שיחה")
        return False
    
    session = get_session()
    if session is None:
        return False
    
    try:
        # יצירת רשומה חדשה
        conversation = Conversation(
            user_id=user_id,
            message_id=message_id,
            role=role,
            content=content
        )
        
        # שמירה במסד הנתונים
        session.add(conversation)
        session.commit()
        
        logger.debug(f"הודעת שיחה נשמרה בהצלחה למשתמש {user_id}")
        return True
    except Exception as e:
        logger.error(f"שגיאה בשמירת הודעת שיחה: {str(e)}")
        session.rollback()
        return False
    finally:
        session.close()


def get_conversation_history(user_id: str, limit: int = MEMORY_MAX_MESSAGES) -> List[Dict[str, Any]]:
    """
    שליפת היסטוריית שיחה של משתמש מסוים
    
    Args:
        user_id: מזהה המשתמש
        limit: מספר מקסימלי של הודעות לשליפה
        
    Returns:
        List[Dict]: רשימת הודעות בפורמט מילון
    """
    if not DB_ENABLED:
        logger.debug("מסד הנתונים מושבת, החזרת היסטוריית שיחה ריקה")
        return []
    
    session = get_session()
    if session is None:
        return []
    
    try:
        # שליפת ההיסטוריה מהמסד
        conversations = Conversation.get_user_history(session, user_id, limit)
        
        # המרה לרשימת מילונים
        history = [conv.to_dict() for conv in conversations]
        
        # מיון לפי זמן (מהישן לחדש)
        history.sort(key=lambda x: x['timestamp'])
        
        logger.debug(f"נשלפו {len(history)} הודעות מהיסטוריית השיחה של משתמש {user_id}")
        return history
    except Exception as e:
        logger.error(f"שגיאה בשליפת היסטוריית שיחה: {str(e)}")
        return []
    finally:
        session.close()


def clear_conversation_history(user_id: str) -> bool:
    """
    מחיקת היסטוריית שיחה של משתמש מסוים
    
    Args:
        user_id: מזהה המשתמש
        
    Returns:
        bool: האם המחיקה הצליחה
    """
    if not DB_ENABLED:
        logger.debug("מסד הנתונים מושבת, דילוג על מחיקת היסטוריית שיחה")
        return False
    
    session = get_session()
    if session is None:
        return False
    
    try:
        # מחיקת ההיסטוריה
        deleted_count = Conversation.clear_user_history(session, user_id)
        
        logger.info(f"נמחקו {deleted_count} הודעות מהיסטוריית השיחה של משתמש {user_id}")
        return True
    except Exception as e:
        logger.error(f"שגיאה במחיקת היסטוריית שיחה: {str(e)}")
        session.rollback()
        return False
    finally:
        session.close()


def get_cached_response(query: str) -> Optional[str]:
    """
    שליפת תשובה מהמטמון לפי שאילתה
    
    Args:
        query: השאילתה לחיפוש
        
    Returns:
        Optional[str]: התשובה מהמטמון, או None אם לא נמצאה
    """
    if not DB_ENABLED:
        logger.debug("מסד הנתונים מושבת, דילוג על שליפה מהמטמון")
        return None
    
    session = get_session()
    if session is None:
        return None
    
    try:
        # יצירת hash לשאילתה
        query_hash = hashlib.sha256(query.encode()).hexdigest()
        
        # חיפוש במטמון
        cache_entry = CachedResponse.get_by_query_hash(session, query_hash)
        
        if cache_entry:
            # עדכון זמן גישה אחרון ומספר גישות
            CachedResponse.update_access(session, cache_entry)
            
            logger.debug(f"נמצאה תשובה במטמון לשאילתה: {query[:50]}...")
            return cache_entry.response
        
        logger.debug(f"לא נמצאה תשובה במטמון לשאילתה: {query[:50]}...")
        return None
    except Exception as e:
        logger.error(f"שגיאה בשליפה מהמטמון: {str(e)}")
        return None
    finally:
        session.close()


def save_to_cache(query: str, response: str) -> bool:
    """
    שמירת תשובה במטמון
    
    Args:
        query: השאילתה
        response: התשובה לשמירה
        
    Returns:
        bool: האם השמירה הצליחה
    """
    if not DB_ENABLED:
        logger.debug("מסד הנתונים מושבת, דילוג על שמירה במטמון")
        return False
    
    session = get_session()
    if session is None:
        return False
    
    try:
        # יצירת hash לשאילתה
        query_hash = hashlib.sha256(query.encode()).hexdigest()
        
        # בדיקה אם כבר קיים במטמון
        existing = CachedResponse.get_by_query_hash(session, query_hash)
        
        if existing:
            # עדכון התשובה הקיימת
            existing.response = response
            existing.last_accessed = datetime.datetime.utcnow()
            existing.access_count += 1
        else:
            # יצירת רשומה חדשה
            cache_entry = CachedResponse(
                query_hash=query_hash,
                query=query,
                response=response
            )
            session.add(cache_entry)
        
        session.commit()
        logger.debug(f"תשובה נשמרה במטמון בהצלחה לשאילתה: {query[:50]}...")
        return True
    except Exception as e:
        logger.error(f"שגיאה בשמירה במטמון: {str(e)}")
        session.rollback()
        return False
    finally:
        session.close()


def get_user_preferences(user_id: str) -> Dict[str, Any]:
    """
    שליפת העדפות משתמש
    
    Args:
        user_id: מזהה המשתמש
        
    Returns:
        Dict: מילון עם העדפות המשתמש
    """
    if not DB_ENABLED:
        logger.debug("מסד הנתונים מושבת, החזרת העדפות ברירת מחדל")
        return {"language": "he", "notifications_enabled": True}
    
    session = get_session()
    if session is None:
        return {"language": "he", "notifications_enabled": True}
    
    try:
        # שליפה או יצירת העדפות משתמש
        user_pref = UserPreference.get_or_create(session, user_id)
        
        # בניית מילון התוצאה
        result = {
            "language": user_pref.language,
            "notifications_enabled": user_pref.notifications_enabled,
            **user_pref.get_preferences()
        }
        
        logger.debug(f"נשלפו העדפות משתמש עבור {user_id}")
        return result
    except Exception as e:
        logger.error(f"שגיאה בשליפת העדפות משתמש: {str(e)}")
        return {"language": "he", "notifications_enabled": True}
    finally:
        session.close()


def update_user_preference(user_id: str, key: str, value: Any) -> bool:
    """
    עדכון העדפת משתמש ספציפית
    
    Args:
        user_id: מזהה המשתמש
        key: מפתח ההעדפה
        value: ערך ההעדפה
        
    Returns:
        bool: האם העדכון הצליח
    """
    if not DB_ENABLED:
        logger.debug("מסד הנתונים מושבת, דילוג על עדכון העדפת משתמש")
        return False
    
    session = get_session()
    if session is None:
        return False
    
    try:
        # שליפה או יצירת העדפות משתמש
        user_pref = UserPreference.get_or_create(session, user_id)
        
        # עדכון ההעדפה
        if key == "language":
            user_pref.language = value
        elif key == "notifications_enabled":
            user_pref.notifications_enabled = value
        else:
            user_pref.update_preference(key, value)
        
        session.commit()
        logger.debug(f"עודכנה העדפת משתמש {key}={value} עבור {user_id}")
        return True
    except Exception as e:
        logger.error(f"שגיאה בעדכון העדפת משתמש: {str(e)}")
        session.rollback()
        return False
    finally:
        session.close()


def cleanup_database(days_conversations: int = 30, days_cache: int = 7) -> Tuple[int, int]:
    """
    ניקוי תקופתי של מסד הנתונים - מחיקת נתונים ישנים
    
    Args:
        days_conversations: מספר ימים לשמירת שיחות
        days_cache: מספר ימים לשמירת מטמון
        
    Returns:
        Tuple[int, int]: מספר רשומות שנמחקו (שיחות, מטמון)
    """
    if not DB_ENABLED:
        logger.debug("מסד הנתונים מושבת, דילוג על ניקוי תקופתי")
        return (0, 0)
    
    session = get_session()
    if session is None:
        return (0, 0)
    
    try:
        # ניקוי שיחות ישנות
        conversations_deleted = Conversation.cleanup_old_conversations(session, days_conversations)
        
        # ניקוי מטמון ישן
        cache_deleted = CachedResponse.cleanup_old_entries(session, days_cache)
        
        logger.info(f"ניקוי תקופתי של מסד הנתונים: נמחקו {conversations_deleted} שיחות ו-{cache_deleted} רשומות מטמון")
        return (conversations_deleted, cache_deleted)
    except Exception as e:
        logger.error(f"שגיאה בניקוי תקופתי של מסד הנתונים: {str(e)}")
        session.rollback()
        return (0, 0)
    finally:
        session.close() 