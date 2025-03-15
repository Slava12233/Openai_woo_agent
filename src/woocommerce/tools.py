"""
מודול שמחבר בין הכלים של OpenAI לפונקציות של WooCommerce
"""

import logging
from typing import Dict, List, Any, Optional

from src.woocommerce.api import (
    get_products,
    get_categories,
    get_orders,
    get_store_info,
    create_product,
    update_product,
    delete_product
)

# הגדרת לוגר
logger = logging.getLogger(__name__)

def get_products_tool() -> List[Dict[str, Any]]:
    """
    כלי שמחזיר רשימה של כל המוצרים בחנות
    
    Returns:
        רשימה של מוצרים
    """
    logger.info("Running get_products_tool")
    return get_products()

def get_categories_tool() -> List[Dict[str, Any]]:
    """
    כלי שמחזיר רשימה של כל הקטגוריות בחנות
    
    Returns:
        רשימה של קטגוריות
    """
    logger.info("Running get_categories_tool")
    return get_categories()

def get_orders_tool() -> List[Dict[str, Any]]:
    """
    כלי שמחזיר רשימה של כל ההזמנות בחנות
    
    Returns:
        רשימה של הזמנות
    """
    logger.info("Running get_orders_tool")
    return get_orders()

def get_store_info_tool() -> Dict[str, Any]:
    """
    כלי שמחזיר מידע כללי על החנות
    
    Returns:
        מידע על החנות
    """
    logger.info("Running get_store_info_tool")
    return get_store_info()

def create_product_tool(
    name: str,
    regular_price: str,
    description: Optional[str] = None,
    categories: Optional[List[Dict[str, int]]] = None
) -> Dict[str, Any]:
    """
    כלי שיוצר מוצר חדש בחנות
    
    Args:
        name: שם המוצר
        regular_price: המחיר הרגיל של המוצר
        description: תיאור המוצר (אופציונלי)
        categories: רשימת הקטגוריות שהמוצר שייך אליהן (אופציונלי)
    
    Returns:
        המוצר שנוצר
    """
    logger.info(f"Running create_product_tool with name: {name}")
    
    # הכן את נתוני המוצר
    product_data = {
        "name": name,
        "regular_price": regular_price
    }
    
    # הוסף תיאור אם סופק
    if description is not None:
        product_data["description"] = description
    
    # הוסף קטגוריות אם סופקו
    if categories:
        product_data["categories"] = categories
    
    # צור את המוצר
    return create_product(product_data)

def update_product_tool(
    id: int,
    name: Optional[str] = None,
    regular_price: Optional[str] = None,
    description: Optional[str] = None,
    categories: Optional[List[Dict[str, int]]] = None
) -> Dict[str, Any]:
    """
    כלי שמעדכן מוצר קיים בחנות
    
    Args:
        id: מזהה המוצר לעדכון
        name: שם המוצר החדש (אופציונלי)
        regular_price: המחיר הרגיל החדש של המוצר (אופציונלי)
        description: תיאור המוצר החדש (אופציונלי)
        categories: רשימת הקטגוריות החדשות שהמוצר שייך אליהן (אופציונלי)
    
    Returns:
        המוצר המעודכן
    """
    logger.info(f"Running update_product_tool for product ID: {id}")
    
    # הכן את נתוני המוצר לעדכון
    product_data = {}
    
    # הוסף רק את השדות שסופקו
    if name is not None:
        product_data["name"] = name
    
    if regular_price is not None:
        product_data["regular_price"] = regular_price
    
    if description is not None:
        product_data["description"] = description
    
    if categories is not None:
        product_data["categories"] = categories
    
    # עדכן את המוצר
    return update_product(id, product_data)

def delete_product_tool(id: int) -> Dict[str, Any]:
    """
    כלי שמוחק מוצר מהחנות
    
    Args:
        id: מזהה המוצר למחיקה
    
    Returns:
        תוצאת המחיקה
    """
    logger.info(f"Running delete_product_tool for product ID: {id}")
    return delete_product(id)

# מילון של כלים ופונקציות שמטפלות בהם
TOOL_HANDLERS = {
    "get_products_tool": get_products_tool,
    "get_categories_tool": get_categories_tool,
    "get_orders_tool": get_orders_tool,
    "get_store_info_tool": get_store_info_tool,
    "create_product_tool": create_product_tool,
    "update_product_tool": update_product_tool,
    "delete_product_tool": delete_product_tool
} 