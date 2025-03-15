"""
מודול לניהול חיבור למסד נתונים PostgreSQL
"""

import logging
from typing import Optional
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.engine import Engine

from src.config import (
    DB_ENABLED, DB_HOST, DB_PORT, DB_NAME, 
    DB_USER, DB_PASSWORD, DB_POOL_SIZE, DB_MAX_OVERFLOW
)

# יצירת בסיס למודלים
Base = declarative_base()

# יצירת לוגר
logger = logging.getLogger(__name__)

# משתנים גלובליים
_engine: Optional[Engine] = None
_SessionFactory = None


def get_engine() -> Optional[Engine]:
    """
    מחזיר את מנוע מסד הנתונים הנוכחי
    """
    global _engine
    
    if not DB_ENABLED:
        logger.warning("מסד הנתונים מושבת בהגדרות")
        return None
    
    if _engine is None:
        try:
            # יצירת מחרוזת חיבור למסד הנתונים
            connection_string = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
            
            # יצירת מנוע מסד הנתונים
            _engine = create_engine(
                connection_string,
                pool_size=DB_POOL_SIZE,
                max_overflow=DB_MAX_OVERFLOW,
                echo=False  # הגדר ל-True לדיבוג
            )
            
            logger.info(f"נוצר חיבור למסד נתונים: {DB_HOST}:{DB_PORT}/{DB_NAME}")
        except Exception as e:
            logger.error(f"שגיאה ביצירת חיבור למסד נתונים: {str(e)}")
            _engine = None
    
    return _engine


def get_session():
    """
    מחזיר סשן חדש למסד הנתונים
    """
    global _SessionFactory
    
    engine = get_engine()
    if engine is None:
        logger.warning("לא ניתן ליצור סשן - מנוע מסד הנתונים לא זמין")
        return None
    
    if _SessionFactory is None:
        _SessionFactory = scoped_session(sessionmaker(bind=engine))
    
    return _SessionFactory()


def init_db():
    """
    אתחול מסד הנתונים - יצירת טבלאות אם הן לא קיימות
    """
    if not DB_ENABLED:
        logger.info("מסד הנתונים מושבת בהגדרות, דילוג על אתחול")
        return False
    
    engine = get_engine()
    if engine is None:
        logger.error("לא ניתן לאתחל את מסד הנתונים - מנוע מסד הנתונים לא זמין")
        return False
    
    try:
        # יבוא מודלים כדי לוודא שהם נטענים
        from src.database.models import Conversation, CachedResponse, UserPreference
        
        # יצירת כל הטבלאות
        Base.metadata.create_all(engine)
        logger.info("מסד הנתונים אותחל בהצלחה")
        return True
    except Exception as e:
        logger.error(f"שגיאה באתחול מסד הנתונים: {str(e)}")
        return False


def close_db():
    """
    סגירת החיבור למסד הנתונים
    """
    global _engine, _SessionFactory
    
    if _SessionFactory is not None:
        _SessionFactory.remove()
        _SessionFactory = None
    
    if _engine is not None:
        _engine.dispose()
        _engine = None
        logger.info("החיבור למסד הנתונים נסגר") 