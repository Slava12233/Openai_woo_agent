"""
מודול לתקשורת עם WooCommerce API
"""

import logging
from typing import Dict, List, Any, Optional
from woocommerce import API

from src.config import WOO_URL, WOO_CONSUMER_KEY, WOO_CONSUMER_SECRET, WOO_API_VERSION
from src.woocommerce.cache import cached

# הגדרת לוגר
logger = logging.getLogger(__name__)

# יצירת חיבור ל-WooCommerce API
woocommerce = API(
    url=WOO_URL,
    consumer_key=WOO_CONSUMER_KEY,
    consumer_secret=WOO_CONSUMER_SECRET,
    version=WOO_API_VERSION,
    timeout=30
)

@cached()
def get_products() -> List[Dict[str, Any]]:
    """
    מחזיר רשימה של כל המוצרים בחנות
    
    Returns:
        רשימה של מוצרים
    """
    logger.info("Getting products list from WooCommerce")
    try:
        response = woocommerce.get("products", params={"per_page": 100})
        return response.json()
    except Exception as e:
        logger.error(f"Error getting products: {e}")
        return []

@cached()
def get_product(product_id: int) -> Optional[Dict[str, Any]]:
    """
    מחזיר מוצר לפי מזהה
    
    Args:
        product_id: מזהה המוצר
    
    Returns:
        מידע על המוצר או None אם המוצר לא נמצא
    """
    logger.info(f"Getting product {product_id} from WooCommerce")
    try:
        response = woocommerce.get(f"products/{product_id}")
        return response.json()
    except Exception as e:
        logger.error(f"Error getting product {product_id}: {e}")
        return None

@cached()
def get_categories() -> List[Dict[str, Any]]:
    """
    מחזיר רשימה של כל הקטגוריות בחנות
    
    Returns:
        רשימה של קטגוריות
    """
    logger.info("Getting categories list from WooCommerce")
    try:
        response = woocommerce.get("products/categories", params={"per_page": 100})
        return response.json()
    except Exception as e:
        logger.error(f"Error getting categories: {e}")
        return []

@cached()
def get_orders() -> List[Dict[str, Any]]:
    """
    מחזיר רשימה של כל ההזמנות בחנות
    
    Returns:
        רשימה של הזמנות
    """
    logger.info("Getting orders list from WooCommerce")
    try:
        response = woocommerce.get("orders", params={"per_page": 100})
        return response.json()
    except Exception as e:
        logger.error(f"Error getting orders: {e}")
        return []

@cached()
def get_order(order_id: int) -> Optional[Dict[str, Any]]:
    """
    מחזיר הזמנה לפי מזהה
    
    Args:
        order_id: מזהה ההזמנה
    
    Returns:
        מידע על ההזמנה או None אם ההזמנה לא נמצאה
    """
    logger.info(f"Getting order {order_id} from WooCommerce")
    try:
        response = woocommerce.get(f"orders/{order_id}")
        return response.json()
    except Exception as e:
        logger.error(f"Error getting order {order_id}: {e}")
        return None

@cached()
def get_store_info() -> Dict[str, Any]:
    """
    מחזיר מידע כללי על החנות
    
    Returns:
        מידע על החנות
    """
    logger.info("Getting store info from WooCommerce")
    try:
        response = woocommerce.get("")
        return response.json()
    except Exception as e:
        logger.error(f"Error getting store info: {e}")
        return {}

def create_product(product_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    יוצר מוצר חדש בחנות
    
    Args:
        product_data: נתוני המוצר
    
    Returns:
        המוצר שנוצר או None אם הייתה שגיאה
    """
    logger.info(f"Creating new product in store: {product_data.get('name', '')}")
    try:
        response = woocommerce.post("products", data=product_data)
        return response.json()
    except Exception as e:
        logger.error(f"Error creating product: {e}")
        return None

def update_product(product_id: int, product_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    מעדכן מוצר קיים בחנות
    
    Args:
        product_id: מזהה המוצר
        product_data: נתוני המוצר המעודכנים
    
    Returns:
        המוצר המעודכן או None אם הייתה שגיאה
    """
    logger.info(f"Updating product {product_id} in store")
    try:
        response = woocommerce.put(f"products/{product_id}", data=product_data)
        return response.json()
    except Exception as e:
        logger.error(f"Error updating product {product_id}: {e}")
        return None

def delete_product(product_id: int) -> bool:
    """
    מוחק מוצר מהחנות
    
    Args:
        product_id: מזהה המוצר
    
    Returns:
        True אם המחיקה הצליחה, אחרת False
    """
    logger.info(f"Deleting product {product_id} from store")
    try:
        response = woocommerce.delete(f"products/{product_id}", params={"force": True})
        return response.status_code == 200
    except Exception as e:
        logger.error(f"Error deleting product {product_id}: {e}")
        return False 