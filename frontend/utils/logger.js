/**
 * מודול לניהול לוגים במערכת
 */

// רמות לוג
export const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
};

// האם להציג לוגים בקונסולה
const SHOW_LOGS = process.env.NODE_ENV !== 'production';

// האם להציג לוגי דיבאג
const SHOW_DEBUG = process.env.NEXT_PUBLIC_DEBUG === 'true';

// מערך לשמירת הלוגים האחרונים
const recentLogs = [];
const MAX_LOGS = 100;

/**
 * פונקציה להוספת לוג
 * @param {string} level רמת הלוג
 * @param {string} message הודעת הלוג
 * @param {any} data מידע נוסף (אופציונלי)
 */
const addLog = (level, message, data = null) => {
  // יצירת אובייקט הלוג
  const log = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data
  };

  // הוספה למערך הלוגים
  recentLogs.unshift(log);
  
  // שמירה על גודל מקסימלי של מערך הלוגים
  if (recentLogs.length > MAX_LOGS) {
    recentLogs.pop();
  }

  // הצגה בקונסולה (רק בסביבת פיתוח)
  if (SHOW_LOGS && (level !== LogLevel.DEBUG || SHOW_DEBUG)) {
    const consoleMethod = {
      [LogLevel.DEBUG]: console.debug,
      [LogLevel.INFO]: console.info,
      [LogLevel.WARN]: console.warn,
      [LogLevel.ERROR]: console.error
    }[level] || console.log;

    if (data) {
      consoleMethod(`[${level.toUpperCase()}] ${message}`, data);
    } else {
      consoleMethod(`[${level.toUpperCase()}] ${message}`);
    }
  }

  return log;
};

/**
 * לוג ברמת דיבאג
 * @param {string} message הודעת הלוג
 * @param {any} data מידע נוסף (אופציונלי)
 */
export const debug = (message, data = null) => addLog(LogLevel.DEBUG, message, data);

/**
 * לוג ברמת מידע
 * @param {string} message הודעת הלוג
 * @param {any} data מידע נוסף (אופציונלי)
 */
export const info = (message, data = null) => addLog(LogLevel.INFO, message, data);

/**
 * לוג ברמת אזהרה
 * @param {string} message הודעת הלוג
 * @param {any} data מידע נוסף (אופציונלי)
 */
export const warn = (message, data = null) => addLog(LogLevel.WARN, message, data);

/**
 * לוג ברמת שגיאה
 * @param {string} message הודעת הלוג
 * @param {any} data מידע נוסף (אופציונלי)
 */
export const error = (message, data = null) => addLog(LogLevel.ERROR, message, data);

/**
 * קבלת הלוגים האחרונים
 * @param {number} count מספר הלוגים לקבלה (ברירת מחדל: כל הלוגים)
 * @returns {Array} מערך הלוגים
 */
export const getLogs = (count = recentLogs.length) => recentLogs.slice(0, count);

/**
 * ניקוי הלוגים
 */
export const clearLogs = () => {
  recentLogs.length = 0;
};

// ייצוא אובייקט הלוגר
const logger = {
  debug,
  info,
  warn,
  error,
  getLogs,
  clearLogs,
  LogLevel
};

export default logger;
