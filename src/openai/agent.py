"""
מודול לתקשורת עם OpenAI API ויצירת סוכן AI באמצעות OpenAI Agents SDK
"""

import logging
import json
import os
import asyncio
from typing import Dict, List, Any, Optional, Callable

from agents import Agent, Runner, function_tool, RunConfig, ModelSettings

from src.config import OPENAI_API_KEY, OPENAI_MODEL, ASSISTANT_INSTRUCTIONS, MEMORY_ENABLED

# הגדרת לוגר
logger = logging.getLogger(__name__)

# מילון גלובלי לרישום מטפלי כלים
tool_handlers_registry: Dict[str, Callable] = {}

# סוכן OpenAI - יאותחל בפונקציה create_or_get_agent
agent = None

# מילון של תשובות מוכנות מראש לשאלות פשוטות
SIMPLE_RESPONSES = {
    # ברכות בסיסיות
    "היי": "היי! איך אני יכול לעזור לך עם חנות ה-WooCommerce שלך היום?",
    "שלום": "שלום! במה אוכל לסייע לך בניהול החנות?",
    "הי": "היי! איך אוכל לעזור לך היום עם החנות?",
    "מה שלומך": "אני מצוין, תודה ששאלת! איך אוכל לעזור לך עם החנות היום?",
    "בוקר טוב": "בוקר טוב! איך אוכל לעזור לך בניהול החנות היום?",
    "ערב טוב": "ערב טוב! במה אוכל לסייע לך בחנות?",
    "לילה טוב": "לילה טוב! אשמח לעזור לך שוב מחר.",
    "תודה": "בשמחה! אם תצטרך עזרה נוספת, אני כאן.",
    "ביי": "להתראות! אשמח לעזור לך שוב בפעם הבאה.",
    "להתראות": "להתראות! אשמח לעזור לך שוב בקרוב.",
    
    # שאלות על יכולות הבוט
    "מה אתה יכול לעשות": "אני יכול לעזור לך בניהול חנות ה-WooCommerce שלך במגוון דרכים:\n\n1. הצגת מידע על מוצרים, קטגוריות והזמנות\n2. יצירת מוצרים חדשים\n3. עדכון מוצרים קיימים\n4. מחיקת מוצרים\n5. ניהול הזמנות\n\nאיך אוכל לעזור לך היום?",
    "מה אתה יודע לעשות": "אני יכול לעזור לך בניהול חנות ה-WooCommerce שלך במגוון דרכים:\n\n1. הצגת מידע על מוצרים, קטגוריות והזמנות\n2. יצירת מוצרים חדשים\n3. עדכון מוצרים קיימים\n4. מחיקת מוצרים\n5. ניהול הזמנות\n\nאיך אוכל לעזור לך היום?",
    "איך אתה יכול לעזור לי": "אני יכול לעזור לך בניהול חנות ה-WooCommerce שלך במגוון דרכים:\n\n1. הצגת מידע על מוצרים, קטגוריות והזמנות\n2. יצירת מוצרים חדשים\n3. עדכון מוצרים קיימים\n4. מחיקת מוצרים\n5. ניהול הזמנות\n\nאיך אוכל לעזור לך היום?",
    "מה אתה עושה": "אני עוזר בניהול חנות ה-WooCommerce שלך. אני יכול להציג מידע על מוצרים, קטגוריות והזמנות, ליצור ולעדכן מוצרים, ולסייע בניהול ההזמנות. במה אוכל לעזור לך?",
    "מה התפקיד שלך": "התפקיד שלי הוא לעזור לך בניהול חנות ה-WooCommerce שלך באמצעות ממשק צ'אט פשוט. אני יכול לבצע פעולות שונות בחנות ולספק לך מידע מהיר ומדויק. במה אוכל לעזור לך היום?",
    
    # שאלות על מוצרים
    "איך אני מוסיף מוצר": "כדי להוסיף מוצר חדש, אתה יכול לכתוב לי משהו כמו: 'צור מוצר חדש בשם X במחיר Y עם התיאור Z'. אני אדאג ליצור את המוצר עבורך בחנות.",
    "איך אני מעדכן מוצר": "כדי לעדכן מוצר קיים, אתה יכול לכתוב לי משהו כמו: 'עדכן את המוצר X ושנה את המחיר ל-Y' או 'שנה את התיאור של המוצר X ל-Z'. אני אדאג לעדכן את המוצר עבורך.",
    "איך אני מוחק מוצר": "כדי למחוק מוצר, אתה יכול לכתוב לי משהו כמו: 'מחק את המוצר X'. אני אדאג למחוק את המוצר מהחנות לאחר שאוודא שזה המוצר הנכון.",
    
    # שאלות על הזמנות
    "איך אני בודק הזמנות": "כדי לבדוק הזמנות, אתה יכול לשאול אותי 'הצג את ההזמנות האחרונות' או 'מה סטטוס ההזמנה מספר X'. אני אציג לך את המידע הרלוונטי מהחנות."
}

# מילון של מילות מפתח לזיהוי שאלות כלליות
KEYWORD_RESPONSES = {
    "יכולות": "אני יכול לעזור לך בניהול חנות ה-WooCommerce שלך במגוון דרכים:\n\n1. הצגת מידע על מוצרים, קטגוריות והזמנות\n2. יצירת מוצרים חדשים\n3. עדכון מוצרים קיימים\n4. מחיקת מוצרים\n5. ניהול הזמנות\n\nאיך אוכל לעזור לך היום?",
    "עזרה": "אני כאן כדי לעזור לך בניהול חנות ה-WooCommerce שלך. אני יכול להציג מידע על מוצרים, קטגוריות והזמנות, ליצור ולעדכן מוצרים, ולסייע בניהול ההזמנות. במה אוכל לעזור לך?",
    "אפשרויות": "הנה האפשרויות העיקריות שאני מציע:\n\n1. הצגת מידע על מוצרים, קטגוריות והזמנות\n2. יצירת מוצרים חדשים\n3. עדכון מוצרים קיימים\n4. מחיקת מוצרים\n5. ניהול הזמנות\n\nאיך אוכל לעזור לך היום?",
    "פקודות": "אני מבין פקודות טבעיות בעברית. למשל:\n- 'הצג את כל המוצרים'\n- 'צור מוצר חדש בשם X'\n- 'עדכן את המוצר Y'\n- 'מחק את המוצר Z'\n- 'הצג את ההזמנות האחרונות'\n\nאיך אוכל לעזור לך היום?",
    "מה אתה": "אני עוזר וירטואלי המתמחה בניהול חנויות WooCommerce. אני יכול לעזור לך לנהל את המוצרים, הקטגוריות וההזמנות בחנות שלך באמצעות שיחה פשוטה בעברית. במה אוכל לעזור לך היום?"
}

# מטמון תשובות לשאלות קודמות
response_cache = {}

def create_or_get_agent() -> Agent:
    """
    יוצר סוכן OpenAI חדש או מחזיר סוכן קיים
    
    Returns:
        סוכן OpenAI
    """
    global agent
    
    # אם כבר יש סוכן, מחזיר אותו
    if agent:
        return agent
    
    logger.info("Creating new OpenAI agent")
    try:
        # הגדרת מפתח ה-API כמשתנה סביבה (הדרך שבה הספרייה משתמשת בו)
        os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
        
        # יצירת רשימת כלים מהמטפלים הרשומים
        tools = []
        
        # יצירת פונקציות עוטפות לכל כלי
        # הגדרת פונקציה עוטפת לקבלת מוצרים
        @function_tool
        async def get_products_tool() -> List[Dict[str, Any]]:
            """
            מחזיר רשימה של כל המוצרים בחנות
            """
            try:
                handler = tool_handlers_registry.get("get_products_tool")
                if handler:
                    return handler()
                else:
                    logger.error("Handler for get_products_tool not found")
                    return {"error": "Handler not found"}
            except Exception as e:
                logger.error(f"Error in get_products_tool: {str(e)}")
                return {"error": str(e)}
        
        # הגדרת פונקציה עוטפת לקבלת קטגוריות
        @function_tool
        async def get_categories_tool() -> List[Dict[str, Any]]:
            """
            מחזיר רשימה של כל הקטגוריות בחנות
            """
            try:
                handler = tool_handlers_registry.get("get_categories_tool")
                if handler:
                    return handler()
                else:
                    logger.error("Handler for get_categories_tool not found")
                    return {"error": "Handler not found"}
            except Exception as e:
                logger.error(f"Error in get_categories_tool: {str(e)}")
                return {"error": str(e)}
        
        # הגדרת פונקציה עוטפת לקבלת הזמנות
        @function_tool
        async def get_orders_tool() -> List[Dict[str, Any]]:
            """
            מחזיר רשימה של כל ההזמנות בחנות
            """
            try:
                handler = tool_handlers_registry.get("get_orders_tool")
                if handler:
                    return handler()
                else:
                    logger.error("Handler for get_orders_tool not found")
                    return {"error": "Handler not found"}
            except Exception as e:
                logger.error(f"Error in get_orders_tool: {str(e)}")
                return {"error": str(e)}
        
        # הגדרת פונקציה עוטפת לקבלת מידע על החנות
        @function_tool
        async def get_store_info_tool() -> Dict[str, Any]:
            """
            מחזיר מידע כללי על החנות
            """
            try:
                handler = tool_handlers_registry.get("get_store_info_tool")
                if handler:
                    return handler()
                else:
                    logger.error("Handler for get_store_info_tool not found")
                    return {"error": "Handler not found"}
            except Exception as e:
                logger.error(f"Error in get_store_info_tool: {str(e)}")
                return {"error": str(e)}
        
        # הגדרת פונקציה עוטפת ליצירת מוצר
        @function_tool
        async def create_product_tool(name: str, regular_price: str, description: Optional[str] = None, categories: Optional[List[Dict[str, int]]] = None) -> Dict[str, Any]:
            """
            יוצר מוצר חדש בחנות
            
            Args:
                name: שם המוצר
                regular_price: המחיר הרגיל של המוצר
                description: תיאור המוצר (אופציונלי)
                categories: רשימת הקטגוריות שהמוצר שייך אליהן (אופציונלי)
            """
            try:
                handler = tool_handlers_registry.get("create_product_tool")
                if handler:
                    return handler(name=name, regular_price=regular_price, description=description, categories=categories)
                else:
                    logger.error("Handler for create_product_tool not found")
                    return {"error": "Handler not found"}
            except Exception as e:
                logger.error(f"Error in create_product_tool: {str(e)}")
                return {"error": str(e)}
        
        # הגדרת פונקציה עוטפת לעדכון מוצר
        @function_tool
        async def update_product_tool(id: int, name: Optional[str] = None, regular_price: Optional[str] = None, description: Optional[str] = None, categories: Optional[List[Dict[str, int]]] = None) -> Dict[str, Any]:
            """
            מעדכן מוצר קיים בחנות
            
            Args:
                id: מזהה המוצר לעדכון
                name: שם המוצר החדש (אופציונלי)
                regular_price: המחיר הרגיל החדש של המוצר (אופציונלי)
                description: תיאור המוצר החדש (אופציונלי)
                categories: רשימת הקטגוריות החדשות שהמוצר שייך אליהן (אופציונלי)
            """
            try:
                handler = tool_handlers_registry.get("update_product_tool")
                if handler:
                    return handler(id=id, name=name, regular_price=regular_price, description=description, categories=categories)
                else:
                    logger.error("Handler for update_product_tool not found")
                    return {"error": "Handler not found"}
            except Exception as e:
                logger.error(f"Error in update_product_tool: {str(e)}")
                return {"error": str(e)}
        
        # הגדרת פונקציה עוטפת למחיקת מוצר
        @function_tool
        async def delete_product_tool(id: int) -> Dict[str, Any]:
            """
            מוחק מוצר מהחנות
            
            Args:
                id: מזהה המוצר למחיקה
            """
            try:
                handler = tool_handlers_registry.get("delete_product_tool")
                if handler:
                    return handler(id=id)
                else:
                    logger.error("Handler for delete_product_tool not found")
                    return {"error": "Handler not found"}
            except Exception as e:
                logger.error(f"Error in delete_product_tool: {str(e)}")
                return {"error": str(e)}
        
        # הוספת כל הכלים לרשימה
        tools = [
            get_products_tool,
            get_categories_tool,
            get_orders_tool,
            get_store_info_tool,
            create_product_tool,
            update_product_tool,
            delete_product_tool
        ]
        
        # יצירת הגדרות מודל באמצעות ModelSettings
        model_settings = ModelSettings(
            temperature=0.2  # הגדרת temperature נמוך יותר לתשובות יותר ממוקדות
        )
        
        # יצירת הסוכן עם הגדרות מיטביות
        agent = Agent(
            name="WooCommerce Assistant",
            instructions=ASSISTANT_INSTRUCTIONS,
            model=OPENAI_MODEL,
            tools=tools,
            model_settings=model_settings
        )
        
        logger.info(f"OpenAI agent created successfully with {len(tools)} tools")
        return agent
    except Exception as e:
        logger.error(f"Error creating OpenAI agent: {e}")
        logger.exception("Full traceback:")
        raise

def register_tools(tool_handlers: Dict[str, Callable]) -> None:
    """
    רושם פונקציות שיטפלו בקריאות לכלים
    
    Args:
        tool_handlers: מילון של שמות כלים ופונקציות שיטפלו בהם
    """
    global tool_handlers_registry
    tool_handlers_registry = tool_handlers
    logger.info(f"Registered {len(tool_handlers)} tool handlers")

def is_simple_question(message: str) -> Optional[str]:
    """
    בודק אם ההודעה היא שאלה פשוטה שיש לה תשובה מוכנה מראש
    
    Args:
        message: הודעת המשתמש
    
    Returns:
        תשובה מוכנה מראש אם קיימת, אחרת None
    """
    # נקה את ההודעה
    clean_message = message.strip().lower().rstrip("?!.")
    
    # בדוק אם ההודעה נמצאת במילון התשובות המוכנות מראש
    if clean_message in SIMPLE_RESPONSES:
        logger.info(f"Identified simple question: '{clean_message}'")
        return SIMPLE_RESPONSES[clean_message]
    
    # בדוק אם ההודעה נמצאת במטמון התשובות
    if clean_message in response_cache:
        logger.info(f"Found cached response for: '{clean_message}'")
        return response_cache[clean_message]
    
    # בדוק אם ההודעה מכילה מילות מפתח
    for keyword, response in KEYWORD_RESPONSES.items():
        if keyword in clean_message:
            logger.info(f"Identified keyword '{keyword}' in message: '{clean_message}'")
            # שמור את התשובה במטמון
            response_cache[clean_message] = response
            return response
    
    # בדוק אם ההודעה דומה לשאלות נפוצות (בדיקה פשוטה)
    for question in SIMPLE_RESPONSES:
        # בדוק אם השאלה הנוכחית מכילה את השאלה מהמילון או להיפך
        if (question in clean_message) or (len(clean_message) > 5 and clean_message in question):
            logger.info(f"Found similar question: '{question}' for '{clean_message}'")
            # שמור את התשובה במטמון
            response_cache[clean_message] = SIMPLE_RESPONSES[question]
            return SIMPLE_RESPONSES[question]
    
    return None

async def _process_message_async(message: str, conversation_history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
    """
    מעבד הודעה באופן אסינכרוני
    
    Args:
        message: הודעת המשתמש
        conversation_history: היסטוריית השיחה (אופציונלי)
    
    Returns:
        מילון עם התשובה ומזהה השרשור
    """
    logger.info("Processing user message asynchronously")
    
    # מדוד את זמן ההתחלה
    start_time = asyncio.get_event_loop().time()
    
    # בדוק אם יש תשובה במטמון
    clean_message = message.strip().lower().rstrip("?!.")
    if clean_message in response_cache:
        logger.info(f"Found cached response for: '{clean_message}'")
        cached_response = response_cache[clean_message]
        
        # מדוד את זמן הסיום ורשום ללוג
        end_time = asyncio.get_event_loop().time()
        logger.info(f"Cache hit processing time: {end_time - start_time:.4f} seconds")
        
        return {
            "thread_id": "not_used_with_sdk",
            "response": cached_response,
            "success": True
        }
    
    try:
        # קבל או צור סוכן
        agent = create_or_get_agent()
        
        try:
            # יצירת Runner להפעלת הסוכן
            runner = Runner(agent)
            
            # הגדרת הגדרות הרצה
            run_config = RunConfig(
                model_settings=ModelSettings(
                    model=OPENAI_MODEL,
                    temperature=0.2  # טמפרטורה נמוכה לתשובות יותר עקביות
                )
            )
            
            # הוסף היסטוריית שיחה אם קיימת
            if MEMORY_ENABLED and conversation_history:
                logger.info(f"Adding conversation history with {len(conversation_history)} messages")
                
                # הפעל את הסוכן עם היסטוריית השיחה
                result = await runner.run(
                    message,
                    run_config=run_config,
                    messages=conversation_history
                )
            else:
                # הפעל את הסוכן ללא היסטוריית שיחה
                result = await runner.run(
                    message,
                    run_config=run_config
                )
            
            # בדוק אם התקבלה תוצאה
            if not result:
                logger.error("No result returned from Runner.run")
                return {
                    "thread_id": "not_used_with_sdk",
                    "response": "שגיאה בעיבוד ההודעה: לא התקבלה תשובה מהסוכן",
                    "success": False
                }
            
            # רשום את סוג התוצאה ותוכנה ללוגים לצורך דיבוג
            logger.info(f"Result type: {type(result)}")
            logger.info(f"Result has final_output: {hasattr(result, 'final_output')}")
            
            # גש לשדה final_output של התוצאה
            if hasattr(result, 'final_output'):
                response = result.final_output
            else:
                # אם אין שדה final_output, נסה לטפל בתוצאה כמחרוזת
                response = str(result)
            
            # שמור את התשובה במטמון אם זו שאלה כללית
            clean_message = message.strip().lower().rstrip("?!.")
            if any(keyword in clean_message for keyword in ["מה אתה", "יכול", "עושה", "עזרה", "אפשרויות", "פקודות"]):
                logger.info(f"Caching response for general question: '{clean_message}'")
                response_cache[clean_message] = response
            
            # מדוד את זמן הסיום ורשום ללוג
            end_time = asyncio.get_event_loop().time()
            logger.info(f"Full response processing time: {end_time - start_time:.4f} seconds")
            
            return {
                "thread_id": "not_used_with_sdk",
                "response": response,
                "success": True
            }
        except Exception as e:
            logger.error(f"Error running agent: {e}")
            logger.exception("Full traceback:")
            return {
                "thread_id": "not_used_with_sdk",
                "response": f"שגיאה בהפעלת הסוכן: {str(e)}",
                "success": False
            }
    except Exception as e:
        logger.error(f"Error processing message asynchronously: {e}")
        logger.exception("Full traceback:")
        return {
            "thread_id": "not_used_with_sdk",
            "response": f"שגיאה בעיבוד ההודעה: {str(e)}",
            "success": False
        }

async def process_message(message: str, conversation_history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
    """
    מעבד הודעה ומחזיר תשובה מהסוכן (גרסה אסינכרונית)
    
    Args:
        message: הודעת המשתמש
        conversation_history: היסטוריית השיחה (אופציונלי)
    
    Returns:
        מילון עם התשובה ומזהה השרשור
    """
    logger.info("Processing user message")
    
    try:
        # קרא ישירות לפונקציה האסינכרונית
        return await _process_message_async(message, conversation_history)
    except Exception as e:
        logger.error(f"Error processing message: {e}")
        return {
            "thread_id": "not_used_with_sdk",
            "response": f"שגיאה בעיבוד ההודעה: {str(e)}",
            "success": False
        } 