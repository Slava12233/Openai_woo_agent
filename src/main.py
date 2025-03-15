"""
קובץ ראשי של פרויקט WooCommerce Telegram Bot
"""

import logging
import sys
import os
import io

from src.config import LOG_LEVEL, DB_ENABLED
from src.openai.agent import register_tools
from src.woocommerce.tools import TOOL_HANDLERS
from src.telegram.bot import run_bot
from src.database.connection import init_db, close_db
from src.database.scheduler import start_scheduler, stop_scheduler

# הגדרת לוגר עם תמיכה בעברית
# שימוש ב-UTF-8 לקובץ הלוג
log_file_handler = logging.FileHandler(os.path.join(os.path.dirname(__file__), '..', 'bot.log'), encoding='utf-8')

# שימוש ב-StreamHandler מותאם שמתעלם משגיאות encoding
class EncodingFriendlyStreamHandler(logging.StreamHandler):
    def emit(self, record):
        try:
            msg = self.format(record)
            stream = self.stream
            stream.write(msg + self.terminator)
            self.flush()
        except UnicodeEncodeError:
            # במקרה של שגיאת encoding, נשתמש בגרסה ללא תווים מיוחדים
            try:
                msg = record.getMessage().encode('ascii', 'replace').decode('ascii')
                formatted = f"{record.levelname}: {msg}"
                stream = self.stream
                stream.write(formatted + self.terminator)
                self.flush()
            except Exception:
                self.handleError(record)
        except Exception:
            self.handleError(record)

# הגדרת הלוגר
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        EncodingFriendlyStreamHandler(sys.stdout),
        log_file_handler
    ]
)

logger = logging.getLogger(__name__)

def main() -> None:
    """
    פונקציה ראשית שמפעילה את הבוט
    """
    logger.info("Starting WooCommerce Telegram Bot")
    
    try:
        # אתחול מסד הנתונים אם הוא מופעל
        if DB_ENABLED:
            logger.info("Initializing database")
            if init_db():
                logger.info("Database initialized successfully")
                # הפעלת מתזמן ניקוי מסד הנתונים
                start_scheduler()
            else:
                logger.warning("Failed to initialize database, continuing without database support")
        
        # רשום את הכלים של WooCommerce
        register_tools(TOOL_HANDLERS)
        logger.info("WooCommerce tools registered")
        
        # הפעל את בוט הטלגרם
        run_bot()
    except KeyboardInterrupt:
        logger.info("Bot stopped by user")
    except Exception as e:
        logger.error(f"Error starting the bot: {e}")
    finally:
        # סגירת מסד הנתונים ועצירת המתזמן
        if DB_ENABLED:
            logger.info("Stopping database scheduler")
            stop_scheduler()
            logger.info("Closing database connection")
            close_db()
        
        logger.info("Bot shutdown complete")

if __name__ == "__main__":
    main() 