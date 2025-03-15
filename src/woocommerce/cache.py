"""
מודול מטמון (cache) לשיפור ביצועי קריאות ל-WooCommerce API
"""

import time
import json
import logging
from typing import Dict, Any, Callable, Optional, TypeVar, cast
from functools import wraps

from src.config import CACHE_ENABLED, CACHE_EXPIRY

# הגדרת טיפוס גנרי לפונקציות
T = TypeVar('T')

# הגדרת לוגר
logger = logging.getLogger(__name__)

# מטמון גלובלי - מילון שמכיל את כל הנתונים במטמון
# המפתח הוא מחרוזת המייצגת את שם הפונקציה והפרמטרים
# הערך הוא מילון עם הנתונים והזמן שבו הם נשמרו
CACHE: Dict[str, Dict[str, Any]] = {}

def clear_cache() -> None:
    """
    מנקה את כל המטמון
    """
    global CACHE
    logger.info("Clearing cache")
    CACHE.clear()

def clear_cache_for_function(function_name: str) -> None:
    """
    מנקה את המטמון עבור פונקציה מסוימת
    
    Args:
        function_name: שם הפונקציה שעבורה יש לנקות את המטמון
    """
    global CACHE
    keys_to_remove = [key for key in CACHE if key.startswith(f"{function_name}:")]
    for key in keys_to_remove:
        del CACHE[key]
    logger.info(f"Clearing cache for function {function_name}")

def cached(expiry: Optional[int] = None) -> Callable[[Callable[..., T]], Callable[..., T]]:
    """
    דקורטור שמטמין את התוצאה של פונקציה
    
    Args:
        expiry: זמן תפוגה בשניות (ברירת מחדל: CACHE_EXPIRY מקובץ ההגדרות)
    
    Returns:
        הפונקציה המקורית עטופה במנגנון מטמון
    """
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> T:
            # אם המטמון מושבת, פשוט מריץ את הפונקציה המקורית
            if not CACHE_ENABLED:
                return func(*args, **kwargs)
            
            # יוצר מפתח ייחודי לפונקציה והפרמטרים שלה
            cache_key = f"{func.__name__}:{json.dumps(args)}:{json.dumps(kwargs, sort_keys=True)}"
            
            # בודק אם יש תוצאה במטמון ואם היא עדיין תקפה
            current_time = time.time()
            cache_expiry = expiry if expiry is not None else CACHE_EXPIRY
            
            if cache_key in CACHE:
                cached_result = CACHE[cache_key]
                if current_time - cached_result["timestamp"] < cache_expiry:
                    logger.debug(f"Returning result from cache for {func.__name__}")
                    return cast(T, cached_result["data"])
            
            # אם אין תוצאה במטמון או שהיא פגה, מריץ את הפונקציה ושומר את התוצאה
            result = func(*args, **kwargs)
            CACHE[cache_key] = {
                "data": result,
                "timestamp": current_time
            }
            logger.debug(f"Saving result to cache for {func.__name__}")
            return result
        
        return wrapper
    
    return decorator 