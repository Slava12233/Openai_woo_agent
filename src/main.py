"""
קובץ ראשי של פרויקט WooCommerce Telegram Bot
"""

import logging
import sys
import os
import io

from src.config import LOG_LEVEL
from src.openai.agent import register_tools
from src.woocommerce.tools import TOOL_HANDLERS
from src.telegram.bot import run_bot

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
        # רשום את הכלים של WooCommerce
        register_tools(TOOL_HANDLERS)
        logger.info("WooCommerce tools registered")
        
        # הפעל את בוט הטלגרם
        run_bot()
    except Exception as e:
        logger.error(f"Error starting the bot: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 