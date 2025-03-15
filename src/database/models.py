"""
מודלים של מסד הנתונים
"""

import json
import datetime
from typing import Dict, List, Any, Optional

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

# יבוא הבסיס מקובץ החיבור
from src.database.connection import Base


class Conversation(Base):
    """
    מודל לשמירת היסטוריית שיחות
    """
    __tablename__ = 'conversations'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String(50), nullable=False, index=True)
    message_id = Column(String(50), nullable=False)
    role = Column(String(10), nullable=False)  # 'user' או 'assistant'
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    # אינדקס משולב על user_id ו-timestamp לשליפה מהירה של היסטוריית שיחה
    __table_args__ = (
        Index('idx_user_timestamp', user_id, timestamp),
    )
    
    def to_dict(self) -> Dict[str, Any]:
        """
        המרת הרשומה למילון
        """
        return {
            'id': self.id,
            'user_id': self.user_id,
            'message_id': self.message_id,
            'role': self.role,
            'content': self.content,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
    
    @classmethod
    def get_user_history(cls, session, user_id: str, limit: int = 50) -> List['Conversation']:
        """
        שליפת היסטוריית שיחה של משתמש מסוים
        """
        return session.query(cls).filter(
            cls.user_id == user_id
        ).order_by(
            cls.timestamp.desc()
        ).limit(limit).all()
    
    @classmethod
    def clear_user_history(cls, session, user_id: str) -> int:
        """
        מחיקת היסטוריית שיחה של משתמש מסוים
        מחזיר את מספר הרשומות שנמחקו
        """
        result = session.query(cls).filter(cls.user_id == user_id).delete()
        session.commit()
        return result
    
    @classmethod
    def cleanup_old_conversations(cls, session, days: int = 30) -> int:
        """
        מחיקת שיחות ישנות מלפני מספר ימים מסוים
        מחזיר את מספר הרשומות שנמחקו
        """
        cutoff_date = datetime.datetime.utcnow() - datetime.timedelta(days=days)
        result = session.query(cls).filter(cls.timestamp < cutoff_date).delete()
        session.commit()
        return result


class CachedResponse(Base):
    """
    מודל לשמירת תשובות במטמון
    """
    __tablename__ = 'cached_responses'
    
    id = Column(Integer, primary_key=True)
    query_hash = Column(String(64), nullable=False, unique=True, index=True)
    query = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_accessed = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    access_count = Column(Integer, default=1)
    
    @classmethod
    def get_by_query_hash(cls, session, query_hash: str) -> Optional['CachedResponse']:
        """
        שליפת תשובה מהמטמון לפי hash של השאילתה
        """
        return session.query(cls).filter(cls.query_hash == query_hash).first()
    
    @classmethod
    def update_access(cls, session, cache_entry: 'CachedResponse') -> None:
        """
        עדכון זמן הגישה האחרון ומספר הגישות
        """
        cache_entry.last_accessed = datetime.datetime.utcnow()
        cache_entry.access_count += 1
        session.commit()
    
    @classmethod
    def cleanup_old_entries(cls, session, days: int = 30) -> int:
        """
        מחיקת רשומות ישנות מהמטמון
        מחזיר את מספר הרשומות שנמחקו
        """
        cutoff_date = datetime.datetime.utcnow() - datetime.timedelta(days=days)
        result = session.query(cls).filter(cls.last_accessed < cutoff_date).delete()
        session.commit()
        return result


class UserPreference(Base):
    """
    מודל לשמירת העדפות משתמש
    """
    __tablename__ = 'user_preferences'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String(50), nullable=False, unique=True, index=True)
    language = Column(String(10), default='he')  # קוד שפה (he, en, וכו')
    notifications_enabled = Column(Boolean, default=True)
    preferences_json = Column(Text, default='{}')  # העדפות נוספות בפורמט JSON
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    def get_preferences(self) -> Dict[str, Any]:
        """
        המרת שדה ה-JSON להעדפות למילון
        """
        try:
            return json.loads(self.preferences_json)
        except (json.JSONDecodeError, TypeError):
            return {}
    
    def set_preferences(self, preferences: Dict[str, Any]) -> None:
        """
        הגדרת העדפות משתמש
        """
        self.preferences_json = json.dumps(preferences)
    
    def update_preference(self, key: str, value: Any) -> None:
        """
        עדכון העדפה ספציפית
        """
        prefs = self.get_preferences()
        prefs[key] = value
        self.set_preferences(prefs)
    
    @classmethod
    def get_by_user_id(cls, session, user_id: str) -> Optional['UserPreference']:
        """
        שליפת העדפות משתמש לפי מזהה משתמש
        """
        return session.query(cls).filter(cls.user_id == user_id).first()
    
    @classmethod
    def get_or_create(cls, session, user_id: str) -> 'UserPreference':
        """
        שליפת העדפות משתמש או יצירת רשומה חדשה אם לא קיימת
        """
        pref = cls.get_by_user_id(session, user_id)
        if pref is None:
            pref = UserPreference(user_id=user_id)
            session.add(pref)
            session.commit()
        return pref 