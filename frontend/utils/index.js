/**
 * קובץ המכיל פונקציות שימושיות לשימוש בכל הפרויקט
 */

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * מיזוג מחלקות Tailwind באופן חכם
 * @param  {...any} inputs מחלקות CSS
 * @returns {string} מחלקות CSS ממוזגות
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * פורמט מספר למספר עם פסיקים
 * @param {number} num המספר לפורמט
 * @returns {string} המספר המפורמט
 */
export function formatNumber(num) {
  return num.toLocaleString('he-IL');
}

/**
 * קיצור טקסט ארוך והוספת נקודות אם הוא ארוך מדי
 * @param {string} text הטקסט לקיצור
 * @param {number} maxLength האורך המקסימלי
 * @returns {string} הטקסט המקוצר
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * המרת תאריך לפורמט מקומי
 * @param {Date|string} date התאריך להמרה
 * @returns {string} התאריך בפורמט מקומי
 */
export function formatDate(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * המרת תאריך לפורמט מקומי עם שעה
 * @param {Date|string} date התאריך להמרה
 * @returns {string} התאריך והשעה בפורמט מקומי
 */
export function formatDateTime(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * המרת מחרוזת לצבע רקע בהתאם לערך
 * @param {string} str המחרוזת להמרה
 * @returns {string} מחלקת CSS לצבע רקע
 */
export function stringToColor(str) {
  if (!str) return 'bg-gray-200';
  
  const colors = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-purple-100 text-purple-800',
    'bg-yellow-100 text-yellow-800',
    'bg-red-100 text-red-800',
    'bg-indigo-100 text-indigo-800',
    'bg-pink-100 text-pink-800',
    'bg-teal-100 text-teal-800',
  ];
  
  // יצירת מספר מהמחרוזת
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // בחירת צבע מהמערך
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

/**
 * המרת סטטוס לצבע מתאים
 * @param {string} status הסטטוס להמרה
 * @returns {string} מחלקת CSS לצבע
 */
export function getStatusColor(status) {
  const statusMap = {
    'פעיל': 'bg-green-100 text-green-800',
    'לא פעיל': 'bg-red-100 text-red-800',
    'בהמתנה': 'bg-yellow-100 text-yellow-800',
    'בתהליך': 'bg-blue-100 text-blue-800',
    'הושלם': 'bg-green-100 text-green-800',
    'נכשל': 'bg-red-100 text-red-800',
    'בוטל': 'bg-gray-100 text-gray-800',
  };
  
  return statusMap[status] || 'bg-gray-100 text-gray-800';
}

/**
 * המרת פלטפורמה לאייקון מתאים
 * @param {string} platform הפלטפורמה להמרה
 * @returns {string} שם האייקון המתאים
 */
export function getPlatformIcon(platform) {
  const platformMap = {
    'טלגרם': 'telegram',
    'ווצאפ': 'whatsapp',
  };
  
  return platformMap[platform] || 'question';
}

/**
 * יצירת מזהה ייחודי
 * @returns {string} מזהה ייחודי
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * בדיקה אם מחרוזת היא URL תקין
 * @param {string} url המחרוזת לבדיקה
 * @returns {boolean} האם המחרוזת היא URL תקין
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * המרת גודל קובץ לפורמט קריא
 * @param {number} bytes גודל הקובץ בבייטים
 * @returns {string} גודל הקובץ בפורמט קריא
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
