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

from src.config import TELEGRAM_BOT_TOKEN, DEBUG
from src.openai.agent import process_message, is_simple_question

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
    logger.info(f"User {update.effective_user.id} started a conversation")
    
    # שלח הודעת פתיחה
    await update.message.reply_text(
        "שלום! אני בוט WooCommerce שיכול לעזור לך לנהל את החנות שלך.\n"
        "אתה יכול לשאול אותי על מוצרים, קטגוריות, הזמנות ועוד.\n"
        "נסה לשאול אותי 'מה המוצרים בחנות?' או 'כמה הזמנות יש?'"
    )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    מטפל בפקודת /help
    
    Args:
        update: אובייקט Update מטלגרם
        context: אובייקט Context מטלגרם
    """
    logger.info(f"User {update.effective_user.id} requested help")
    
    # שלח הודעת עזרה
    await update.message.reply_text(
        "הנה כמה דברים שאני יכול לעזור לך בהם:\n\n"
        "- הצגת מוצרים בחנות\n"
        "- הצגת קטגוריות\n"
        "- הצגת הזמנות\n"
        "- יצירת מוצרים חדשים\n"
        "- קבלת מידע על החנות\n\n"
        "פשוט שאל אותי בשפה טבעית ואני אעזור לך!"
    )

async def clear_cache_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    מטפל בפקודת /clear_cache
    
    Args:
        update: אובייקט Update מטלגרם
        context: אובייקט Context מטלגרם
    """
    logger.info(f"User {update.effective_user.id} requested cache clearing")
    
    # יבוא מקומי כדי למנוע יבוא מעגלי
    from src.woocommerce.cache import clear_cache
    
    # נקה את המטמון
    clear_cache()
    
    # שלח הודעת אישור
    await update.message.reply_text("המטמון נוקה בהצלחה!")

async def reset_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    מטפל בפקודת /reset - מאפס את השיחה
    
    Args:
        update: אובייקט Update מטלגרם
        context: אובייקט Context מטלגרם
    """
    user_id = update.effective_user.id
    logger.info(f"User {user_id} requested conversation reset")
    
    # עם ה-SDK החדש, אין צורך לנהל מזהי שרשורים
    # פשוט שלח הודעת אישור
    await update.message.reply_text("השיחה אופסה בהצלחה! אתה יכול להתחיל שיחה חדשה.")

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
    
    # בדוק אם זו שאלה פשוטה
    simple_response = is_simple_question(message_text)
    if simple_response:
        # אם זו שאלה פשוטה, שלח תשובה מיידית
        await update.message.reply_text(simple_response)
        return
    
    # שלח הודעת "מעבד..." כדי לתת משוב מיידי למשתמש
    processing_message = await update.message.reply_text("מעבד את הבקשה שלך...")
    
    # הפעל טיימר לעדכון אינדיקטור הקלדה
    typing_task = asyncio.create_task(update_typing_indicator(processing_message))
    
    try:
        # עבד את ההודעה באופן אסינכרוני
        response_data = await _process_message_async(message_text)
        
        # עצור את הטיימר
        typing_task.cancel()
        
        if response_data["success"]:
            # עדכן את הודעת "מעבד..." עם התשובה במקום למחוק אותה
            await processing_message.edit_text(response_data["response"])
        else:
            # במקרה של שגיאה, הצג הודעת שגיאה ידידותית
            error_message = "מצטער, לא הצלחתי לעבד את הבקשה שלך. נסה שוב מאוחר יותר."
            if DEBUG:  # הצג את הודעת השגיאה המלאה רק במצב דיבאג
                error_message += f"\n\nפרטי שגיאה: {response_data['response']}"
            await processing_message.edit_text(error_message)
    except Exception as e:
        logger.error(f"Error processing message: {e}")
        
        # עצור את הטיימר
        typing_task.cancel()
        
        # עדכן את הודעת "מעבד..." עם הודעת שגיאה
        await processing_message.edit_text(f"אירעה שגיאה בעיבוד הבקשה שלך. נסה שוב מאוחר יותר.")

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

async def _process_message_async(message: str) -> Dict[str, Any]:
    """
    מעבד הודעה באופן אסינכרוני
    
    Args:
        message: הודעת המשתמש
    
    Returns:
        מילון עם התשובה
    """
    # קורא לפונקציה האסינכרונית process_message עם await
    return await process_message(message)

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
    
    # הוסף מטפל הודעות
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    # הפעל את הבוט
    application.run_polling(allowed_updates=Update.ALL_TYPES)
    
    logger.info("Telegram bot started successfully") 