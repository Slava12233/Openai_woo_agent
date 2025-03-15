"""
מודול לתקשורת עם Telegram API ויצירת בוט
"""

import logging
from typing import Dict, Any, Optional, List, Callable
import asyncio
import time
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    ContextTypes,
    filters
)

from src.config import TELEGRAM_BOT_TOKEN, DEBUG, MEMORY_ENABLED, MEMORY_CONTEXT_LIMIT
from src.openai.agent import process_message, is_simple_question
from src.memory import conversation_memory

# הגדרת לוגר
logger = logging.getLogger(__name__)

# זמן המתנה בין עדכוני הודעה (בשניות)
TYPING_INDICATOR_INTERVAL = 1.5

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    מטפל בפקודת /start
    
    Args:
        update: אובייקט Update מטלגרם
        context: אובייקט Context מטלגרם
    """
    user_id = update.effective_user.id
    logger.info(f"User {user_id} started a conversation")
    
    # שלח הודעת פתיחה
    welcome_message = (
        "שלום! אני בוט WooCommerce שיכול לעזור לך לנהל את החנות שלך.\n"
        "אתה יכול לשאול אותי על מוצרים, קטגוריות, הזמנות ועוד.\n"
        "נסה לשאול אותי 'מה המוצרים בחנות?' או 'כמה הזמנות יש?'"
    )
    await update.message.reply_text(welcome_message)
    
    # שמור את ההודעה בזיכרון השיחה
    if MEMORY_ENABLED:
        conversation_memory.add_message(user_id, "assistant", welcome_message)

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    מטפל בפקודת /help
    
    Args:
        update: אובייקט Update מטלגרם
        context: אובייקט Context מטלגרם
    """
    user_id = update.effective_user.id
    logger.info(f"User {user_id} requested help")
    
    # שלח הודעת עזרה
    help_message = (
        "הנה כמה דברים שאני יכול לעזור לך בהם:\n\n"
        "- הצגת מוצרים בחנות\n"
        "- הצגת קטגוריות\n"
        "- הצגת הזמנות\n"
        "- יצירת מוצרים חדשים\n"
        "- קבלת מידע על החנות\n\n"
        "פקודות זמינות:\n"
        "/start - התחלת שיחה חדשה\n"
        "/help - הצגת עזרה\n"
        "/clear_cache - ניקוי מטמון API\n"
        "/reset - איפוס השיחה\n"
        "/history - הצגת היסטוריית השיחה\n"
        "/clear_history - ניקוי היסטוריית השיחה\n\n"
        "פשוט שאל אותי בשפה טבעית ואני אעזור לך!"
    )
    await update.message.reply_text(help_message)
    
    # שמור את ההודעה בזיכרון השיחה
    if MEMORY_ENABLED:
        conversation_memory.add_message(user_id, "assistant", help_message)

async def clear_cache_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    מטפל בפקודת /clear_cache
    
    Args:
        update: אובייקט Update מטלגרם
        context: אובייקט Context מטלגרם
    """
    user_id = update.effective_user.id
    logger.info(f"User {user_id} requested cache clearing")
    
    # יבוא מקומי כדי למנוע יבוא מעגלי
    from src.woocommerce.cache import clear_cache
    
    # נקה את המטמון
    clear_cache()
    
    # שלח הודעת אישור
    response = "המטמון נוקה בהצלחה!"
    await update.message.reply_text(response)
    
    # שמור את ההודעה בזיכרון השיחה
    if MEMORY_ENABLED:
        conversation_memory.add_message(user_id, "assistant", response)

async def reset_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    מטפל בפקודת /reset - מאפס את השיחה
    
    Args:
        update: אובייקט Update מטלגרם
        context: אובייקט Context מטלגרם
    """
    user_id = update.effective_user.id
    logger.info(f"User {user_id} requested conversation reset")
    
    # נקה את היסטוריית השיחה אם זיכרון השיחה מופעל
    if MEMORY_ENABLED:
        conversation_memory.clear_conversation(user_id)
    
    # שלח הודעת אישור
    response = "השיחה אופסה בהצלחה! אתה יכול להתחיל שיחה חדשה."
    await update.message.reply_text(response)
    
    # שמור את ההודעה החדשה בזיכרון השיחה
    if MEMORY_ENABLED:
        conversation_memory.add_message(user_id, "assistant", response)

async def history_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    מטפל בפקודת /history - מציג את היסטוריית השיחה
    
    Args:
        update: אובייקט Update מטלגרם
        context: אובייקט Context מטלגרם
    """
    user_id = update.effective_user.id
    logger.info(f"User {user_id} requested conversation history")
    
    if not MEMORY_ENABLED:
        response = "זיכרון שיחה אינו מופעל במערכת."
        await update.message.reply_text(response)
        return
    
    # קבל את היסטוריית השיחה
    conversation = conversation_memory.get_conversation(user_id)
    
    if not conversation:
        response = "אין היסטוריית שיחה זמינה."
        await update.message.reply_text(response)
        return
    
    # בנה הודעה עם היסטוריית השיחה
    history_text = "היסטוריית השיחה שלך:\n\n"
    
    for i, message in enumerate(conversation, 1):
        role = "אתה" if message.role == "user" else "הבוט"
        # קיצור תוכן ההודעה אם הוא ארוך מדי
        content = message.content
        if len(content) > 100:
            content = content[:97] + "..."
        
        history_text += f"{i}. {role}: {content}\n\n"
    
    # הוסף סטטיסטיקות
    history_text += f"סה\"כ: {len(conversation)} הודעות בשיחה."
    
    await update.message.reply_text(history_text)

async def clear_history_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    מטפל בפקודת /clear_history - מנקה את היסטוריית השיחה
    
    Args:
        update: אובייקט Update מטלגרם
        context: אובייקט Context מטלגרם
    """
    user_id = update.effective_user.id
    logger.info(f"User {user_id} requested to clear conversation history")
    
    if not MEMORY_ENABLED:
        response = "זיכרון שיחה אינו מופעל במערכת."
        await update.message.reply_text(response)
        return
    
    # נקה את היסטוריית השיחה
    conversation_memory.clear_conversation(user_id)
    
    # שלח הודעת אישור
    response = "היסטוריית השיחה נוקתה בהצלחה!"
    await update.message.reply_text(response)
    
    # שמור את ההודעה החדשה בזיכרון השיחה
    conversation_memory.add_message(user_id, "assistant", response)

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    מטפל בהודעות טקסט רגילות
    
    Args:
        update: אובייקט Update מטלגרם
        context: אובייקט Context מטלגרם
    """
    user_id = update.effective_user.id
    message_text = update.message.text
    logger.info(f"Received message from user {user_id}: {message_text}")
    
    # שמור את הודעת המשתמש בזיכרון השיחה
    if MEMORY_ENABLED:
        conversation_memory.add_message(user_id, "user", message_text)
    
    # בדוק אם זו שאלה פשוטה
    simple_response = is_simple_question(message_text)
    if simple_response:
        # אם זו שאלה פשוטה, שלח תשובה מיידית
        await update.message.reply_text(simple_response)
        
        # שמור את התשובה בזיכרון השיחה
        if MEMORY_ENABLED:
            conversation_memory.add_message(user_id, "assistant", simple_response)
        return
    
    # שלח הודעת "מעבד..." כדי לתת משוב מיידי למשתמש
    processing_message = await update.message.reply_text("מעבד את הבקשה שלך...")
    
    # הפעל טיימר לעדכון אינדיקטור הקלדה
    typing_task = asyncio.create_task(update_typing_indicator(processing_message))
    
    try:
        # קבל את היסטוריית השיחה אם זיכרון השיחה מופעל
        conversation_history = None
        if MEMORY_ENABLED:
            conversation_history = conversation_memory.get_conversation_for_agent(user_id, MEMORY_CONTEXT_LIMIT)
        
        # עבד את ההודעה באופן אסינכרוני
        response_data = await _process_message_async(message_text, conversation_history)
        
        # עצור את הטיימר
        typing_task.cancel()
        
        if response_data["success"]:
            # עדכן את הודעת "מעבד..." עם התשובה במקום למחוק אותה
            await processing_message.edit_text(response_data["response"])
            
            # שמור את התשובה בזיכרון השיחה
            if MEMORY_ENABLED:
                conversation_memory.add_message(user_id, "assistant", response_data["response"])
        else:
            # במקרה של שגיאה, הצג הודעת שגיאה ידידותית
            error_message = "מצטער, לא הצלחתי לעבד את הבקשה שלך. נסה שוב מאוחר יותר."
            if DEBUG:  # הצג את הודעת השגיאה המלאה רק במצב דיבאג
                error_message += f"\n\nפרטי שגיאה: {response_data['response']}"
            await processing_message.edit_text(error_message)
            
            # שמור את הודעת השגיאה בזיכרון השיחה
            if MEMORY_ENABLED:
                conversation_memory.add_message(user_id, "assistant", error_message)
    except Exception as e:
        logger.error(f"Error processing message: {e}")
        
        # עצור את הטיימר
        typing_task.cancel()
        
        # עדכן את הודעת "מעבד..." עם הודעת שגיאה
        error_message = f"אירעה שגיאה בעיבוד הבקשה שלך. נסה שוב מאוחר יותר."
        await processing_message.edit_text(error_message)
        
        # שמור את הודעת השגיאה בזיכרון השיחה
        if MEMORY_ENABLED:
            conversation_memory.add_message(user_id, "assistant", error_message)

async def update_typing_indicator(message):
    """
    מעדכן את אינדיקטור ההקלדה כדי לתת למשתמש תחושה שהבוט עובד
    
    Args:
        message: הודעת הטלגרם לעדכון
    """
    dots = 1
    try:
        while True:
            # עדכן את ההודעה עם מספר נקודות משתנה
            await message.edit_text(f"מעבד את הבקשה שלך{'.' * dots}")
            dots = (dots % 5) + 1  # מחזוריות של 1-5 נקודות
            await asyncio.sleep(TYPING_INDICATOR_INTERVAL)
    except asyncio.CancelledError:
        # הטיימר בוטל, לא צריך לעשות כלום
        pass
    except Exception as e:
        logger.error(f"Error updating typing indicator: {e}")

async def _process_message_async(message: str, conversation_history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
    """
    מעבד הודעה באופן אסינכרוני
    
    Args:
        message: הודעת המשתמש
        conversation_history: היסטוריית השיחה (אופציונלי)
    
    Returns:
        מילון עם התשובה
    """
    # קורא לפונקציה האסינכרונית process_message עם await
    return await process_message(message, conversation_history)

def run_bot() -> None:
    """
    מפעיל את בוט הטלגרם
    """
    logger.info("Starting Telegram bot")
    
    # הגדר את הבוט
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    
    # הוסף מטפלי פקודות
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("clear_cache", clear_cache_command))
    application.add_handler(CommandHandler("reset", reset_command))
    application.add_handler(CommandHandler("history", history_command))
    application.add_handler(CommandHandler("clear_history", clear_history_command))
    
    # הוסף מטפל הודעות
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    # הפעל את הבוט
    application.run_polling(allowed_updates=Update.ALL_TYPES)
    
    logger.info("Telegram bot started successfully") 