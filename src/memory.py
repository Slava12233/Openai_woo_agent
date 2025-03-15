"""
מודול לניהול זיכרון שיחה בבוט הטלגרם.
מאפשר שמירת היסטוריית שיחות לפי מזהה משתמש והעברתה לסוכן ה-AI.
"""

import logging
import time
import uuid
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass

from src.config import MEMORY_MAX_MESSAGES, MEMORY_CONTEXT_LIMIT, DB_ENABLED
from src.database.repository import (
    save_conversation_message,
    get_conversation_history,
    clear_conversation_history
)

# הגדרת לוגר
logger = logging.getLogger(__name__)

@dataclass
class Message:
    """מחלקה המייצגת הודעה בשיחה."""
    role: str  # 'user' או 'assistant'
    content: str  # תוכן ההודעה
    timestamp: float  # זמן יצירת ההודעה
    message_id: str = None  # מזהה ייחודי להודעה
    
    def __post_init__(self):
        """פעולות לאחר אתחול."""
        if self.message_id is None:
            self.message_id = str(uuid.uuid4())
    
    def to_dict(self) -> Dict[str, str]:
        """המרת ההודעה למילון בפורמט שמתאים ל-OpenAI."""
        return {
            "role": self.role,
            "content": self.content
        }
    
    @classmethod
    def from_db_dict(cls, db_dict: Dict[str, Any]) -> 'Message':
        """יצירת הודעה ממילון שהתקבל ממסד הנתונים."""
        timestamp = time.mktime(db_dict['timestamp'].timetuple()) if isinstance(db_dict['timestamp'], str) else time.time()
        return cls(
            role=db_dict['role'],
            content=db_dict['content'],
            timestamp=timestamp,
            message_id=db_dict['message_id']
        )


class ConversationMemory:
    """מחלקה לניהול זיכרון שיחה."""
    
    def __init__(self, max_messages: int = MEMORY_MAX_MESSAGES):
        """
        אתחול זיכרון השיחה.
        
        Args:
            max_messages: מספר מקסימלי של הודעות לשמירה בזיכרון לכל משתמש.
        """
        self.conversations: Dict[int, List[Message]] = {}  # מילון של שיחות לפי מזהה משתמש (זיכרון מקומי)
        self.max_messages = max_messages
        logger.info(f"ConversationMemory initialized with max_messages={max_messages}")
    
    def add_message(self, user_id: int, role: str, content: str) -> None:
        """
        הוספת הודעה לזיכרון השיחה.
        
        Args:
            user_id: מזהה המשתמש.
            role: תפקיד השולח ('user' או 'assistant').
            content: תוכן ההודעה.
        """
        # יצירת הודעה חדשה
        message = Message(role=role, content=content, timestamp=time.time())
        
        # שמירה בזיכרון המקומי
        if user_id not in self.conversations:
            self.conversations[user_id] = []
        
        self.conversations[user_id].append(message)
        
        # שמירה על מגבלת גודל השיחה בזיכרון המקומי
        if len(self.conversations[user_id]) > self.max_messages:
            self.conversations[user_id] = self.conversations[user_id][-self.max_messages:]
        
        # שמירה במסד הנתונים אם הוא מופעל
        if DB_ENABLED:
            save_conversation_message(
                user_id=str(user_id),
                message_id=message.message_id,
                role=role,
                content=content
            )
        
        logger.debug(f"Added message for user {user_id}, role: {role}, content length: {len(content)}")
    
    def get_conversation(self, user_id: int, limit: Optional[int] = None) -> List[Message]:
        """
        קבלת היסטוריית השיחה של משתמש.
        
        Args:
            user_id: מזהה המשתמש.
            limit: מספר ההודעות האחרונות לקבלה (אופציונלי).
            
        Returns:
            רשימת הודעות בשיחה.
        """
        # אם מסד הנתונים מופעל, ננסה לקבל את ההיסטוריה ממנו
        if DB_ENABLED:
            try:
                db_history = get_conversation_history(str(user_id), limit or self.max_messages)
                if db_history:
                    # המרת הרשומות ממסד הנתונים למופעי Message
                    conversation = [Message.from_db_dict(msg) for msg in db_history]
                    return conversation
            except Exception as e:
                logger.error(f"Error retrieving conversation from database: {str(e)}")
        
        # אם לא הצלחנו לקבל ממסד הנתונים, נשתמש בזיכרון המקומי
        if user_id not in self.conversations:
            return []
        
        conversation = self.conversations[user_id]
        if limit:
            conversation = conversation[-limit:]
        
        return conversation
    
    def get_conversation_for_agent(self, user_id: int, limit: Optional[int] = None) -> List[Dict[str, str]]:
        """
        קבלת היסטוריית השיחה בפורמט המתאים לסוכן ה-AI.
        
        Args:
            user_id: מזהה המשתמש.
            limit: מספר ההודעות האחרונות לקבלה (אופציונלי).
            
        Returns:
            רשימת מילונים המייצגים את ההודעות בפורמט המתאים לסוכן.
        """
        conversation = self.get_conversation(user_id, limit or MEMORY_CONTEXT_LIMIT)
        return [message.to_dict() for message in conversation]
    
    def clear_conversation(self, user_id: int) -> None:
        """
        ניקוי היסטוריית השיחה של משתמש.
        
        Args:
            user_id: מזהה המשתמש.
        """
        # ניקוי הזיכרון המקומי
        if user_id in self.conversations:
            self.conversations[user_id] = []
        
        # ניקוי מסד הנתונים אם הוא מופעל
        if DB_ENABLED:
            clear_conversation_history(str(user_id))
        
        logger.info(f"Cleared conversation history for user {user_id}")
    
    def get_stats(self) -> Dict[str, Any]:
        """
        קבלת סטטיסטיקות על זיכרון השיחה.
        
        Returns:
            מילון עם סטטיסטיקות.
        """
        total_users = len(self.conversations)
        total_messages = sum(len(messages) for messages in self.conversations.values())
        avg_messages_per_user = total_messages / total_users if total_users > 0 else 0
        
        stats = {
            "total_users": total_users,
            "total_messages": total_messages,
            "avg_messages_per_user": avg_messages_per_user,
            "max_messages_per_user": self.max_messages,
            "db_enabled": DB_ENABLED
        }
        
        return stats


# יצירת מופע גלובלי של זיכרון השיחה
conversation_memory = ConversationMemory() 