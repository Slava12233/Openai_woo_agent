"""
מודול לניהול זיכרון שיחה בבוט הטלגרם.
מאפשר שמירת היסטוריית שיחות לפי מזהה משתמש והעברתה לסוכן ה-AI.
"""

import logging
import time
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass

# הגדרת לוגר
logger = logging.getLogger(__name__)

@dataclass
class Message:
    """מחלקה המייצגת הודעה בשיחה."""
    role: str  # 'user' או 'assistant'
    content: str  # תוכן ההודעה
    timestamp: float  # זמן יצירת ההודעה
    
    def to_dict(self) -> Dict[str, str]:
        """המרת ההודעה למילון בפורמט שמתאים ל-OpenAI."""
        return {
            "role": self.role,
            "content": self.content
        }


class ConversationMemory:
    """מחלקה לניהול זיכרון שיחה."""
    
    def __init__(self, max_messages: int = 50):
        """
        אתחול זיכרון השיחה.
        
        Args:
            max_messages: מספר מקסימלי של הודעות לשמירה בזיכרון לכל משתמש.
        """
        self.conversations: Dict[int, List[Message]] = {}  # מילון של שיחות לפי מזהה משתמש
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
        if user_id not in self.conversations:
            self.conversations[user_id] = []
        
        message = Message(role=role, content=content, timestamp=time.time())
        self.conversations[user_id].append(message)
        
        # שמירה על מגבלת גודל השיחה
        if len(self.conversations[user_id]) > self.max_messages:
            self.conversations[user_id] = self.conversations[user_id][-self.max_messages:]
        
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
        conversation = self.get_conversation(user_id, limit)
        return [message.to_dict() for message in conversation]
    
    def clear_conversation(self, user_id: int) -> None:
        """
        ניקוי היסטוריית השיחה של משתמש.
        
        Args:
            user_id: מזהה המשתמש.
        """
        if user_id in self.conversations:
            self.conversations[user_id] = []
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
        
        return {
            "total_users": total_users,
            "total_messages": total_messages,
            "avg_messages_per_user": avg_messages_per_user,
            "max_messages_per_user": self.max_messages
        }


# יצירת מופע גלובלי של זיכרון השיחה
conversation_memory = ConversationMemory() 