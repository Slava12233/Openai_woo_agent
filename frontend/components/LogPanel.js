'use client';

import { useState, useEffect, useRef } from 'react';

// סוגי פעולות אפשריות בלוגים
const LOG_TYPES = {
  INFO: 'info',
  DEBUG: 'debug',
  WARNING: 'warning',
  ERROR: 'error',
  API_REQUEST: 'api_request',
  API_RESPONSE: 'api_response',
  BOT_MESSAGE: 'bot_message',
  USER_MESSAGE: 'user_message'
};

// אייקונים לפי סוג פעולה
const LOG_ICONS = {
  [LOG_TYPES.INFO]: '📩',
  [LOG_TYPES.DEBUG]: '🔍',
  [LOG_TYPES.WARNING]: '⚠️',
  [LOG_TYPES.ERROR]: '✗',
  [LOG_TYPES.API_REQUEST]: '📤',
  [LOG_TYPES.API_RESPONSE]: '📥',
  [LOG_TYPES.BOT_MESSAGE]: '🤖',
  [LOG_TYPES.USER_MESSAGE]: '👤'
};

// נתוני לוגים לדוגמה - במציאות יגיעו מהשרת
const generateDemoLogs = (agentId) => {
  const now = new Date();
  const baseTime = now.getTime();
  
  return [
    {
      id: `${agentId}-1`,
      timestamp: new Date(baseTime - 1000 * 60 * 5).toISOString(),
      type: LOG_TYPES.INFO,
      content: '[SERVER] Bot started successfully. Webhook set to https://api.example.com/webhook/telegram',
      level: 'info'
    },
    {
      id: `${agentId}-2`,
      timestamp: new Date(baseTime - 1000 * 60 * 4).toISOString(),
      type: LOG_TYPES.DEBUG,
      content: '[MEMORY] Initializing conversation memory for session #12345',
      level: 'debug'
    },
    {
      id: `${agentId}-3`,
      timestamp: new Date(baseTime - 1000 * 60 * 3).toISOString(),
      type: LOG_TYPES.API_REQUEST,
      content: '[API] GET /api/v1/products?query=headphones&limit=5 HTTP/1.1',
      level: 'info'
    },
    {
      id: `${agentId}-4`,
      timestamp: new Date(baseTime - 1000 * 60 * 3 + 500).toISOString(),
      type: LOG_TYPES.API_RESPONSE,
      content: '[API] Response 200 OK (312ms) - Returned 5 products',
      level: 'info'
    },
    {
      id: `${agentId}-5`,
      timestamp: new Date(baseTime - 1000 * 60 * 2).toISOString(),
      type: LOG_TYPES.USER_MESSAGE,
      content: '[TELEGRAM] Received message from user (id: 87654321): "האם יש לכם אוזניות אלחוטיות?"',
      level: 'info'
    },
    {
      id: `${agentId}-6`,
      timestamp: new Date(baseTime - 1000 * 60 * 2 + 200).toISOString(),
      type: LOG_TYPES.DEBUG,
      content: '[OPENAI] Sending prompt to model gpt-4o with temperature=0.7, max_tokens=500',
      level: 'debug'
    },
    {
      id: `${agentId}-7`,
      timestamp: new Date(baseTime - 1000 * 60 * 2 + 1800).toISOString(),
      type: LOG_TYPES.DEBUG,
      content: '[OPENAI] Received response from model (1243ms, tokens: prompt=142, completion=218, total=360)',
      level: 'debug'
    },
    {
      id: `${agentId}-8`,
      timestamp: new Date(baseTime - 1000 * 60 * 2 + 2000).toISOString(),
      type: LOG_TYPES.BOT_MESSAGE,
      content: '[TELEGRAM] Sent message to user: "כן, יש לנו מספר דגמים של אוזניות אלחוטיות. הנה כמה אפשרויות פופולריות: 1. אוזניות Sony WH-1000XM4 - 1,200 ש"ח, 2. אוזניות Apple AirPods Pro - 950 ש"ח, 3. אוזניות Samsung Galaxy Buds Pro - 800 ש"ח. האם אחד מהדגמים האלה מעניין אותך?"',
      level: 'info'
    },
    {
      id: `${agentId}-9`,
      timestamp: new Date(baseTime - 1000 * 60 * 1).toISOString(),
      type: LOG_TYPES.USER_MESSAGE,
      content: '[TELEGRAM] Received message from user (id: 87654321): "אני מעוניין באוזניות של אפל. האם יש משלוח חינם?"',
      level: 'info'
    },
    {
      id: `${agentId}-10`,
      timestamp: new Date(baseTime - 1000 * 60 * 1 + 200).toISOString(),
      type: LOG_TYPES.API_REQUEST,
      content: '[API] GET /api/v1/shipping-methods?product_id=12345 HTTP/1.1',
      level: 'info'
    },
    {
      id: `${agentId}-11`,
      timestamp: new Date(baseTime - 1000 * 60 * 1 + 500).toISOString(),
      type: LOG_TYPES.API_RESPONSE,
      content: '[API] Response 200 OK (189ms) - Returned 3 shipping methods',
      level: 'info'
    },
    {
      id: `${agentId}-12`,
      timestamp: new Date(baseTime - 1000 * 60 * 1 + 700).toISOString(),
      type: LOG_TYPES.DEBUG,
      content: '[OPENAI] Sending prompt to model gpt-4o with temperature=0.7, max_tokens=500',
      level: 'debug'
    },
    {
      id: `${agentId}-13`,
      timestamp: new Date(baseTime - 1000 * 60 * 1 + 1900).toISOString(),
      type: LOG_TYPES.DEBUG,
      content: '[OPENAI] Received response from model (1156ms, tokens: prompt=287, completion=124, total=411)',
      level: 'debug'
    },
    {
      id: `${agentId}-14`,
      timestamp: new Date(baseTime - 1000 * 60 * 1 + 2000).toISOString(),
      type: LOG_TYPES.BOT_MESSAGE,
      content: '[TELEGRAM] Sent message to user: "כן, אנחנו מציעים משלוח חינם להזמנות מעל 500 ש"ח, כך שהאוזניות של אפל (AirPods Pro - 950 ש"ח) כוללות משלוח חינם. זמן האספקה הוא 3-5 ימי עסקים. האם תרצה להמשיך להזמנה?"',
      level: 'info'
    },
    {
      id: `${agentId}-15`,
      timestamp: new Date(baseTime - 30 * 1000).toISOString(),
      type: LOG_TYPES.USER_MESSAGE,
      content: '[TELEGRAM] Received message from user (id: 87654321): "כן, אני רוצה להזמין"',
      level: 'info'
    },
    {
      id: `${agentId}-16`,
      timestamp: new Date(baseTime - 29 * 1000).toISOString(),
      type: LOG_TYPES.API_REQUEST,
      content: '[API] POST /api/v1/orders HTTP/1.1',
      level: 'info'
    },
    {
      id: `${agentId}-17`,
      timestamp: new Date(baseTime - 28 * 1000).toISOString(),
      type: LOG_TYPES.ERROR,
      content: '[API] Response 500 Internal Server Error (312ms) - {"error":"Payment gateway unavailable"}',
      level: 'error'
    },
    {
      id: `${agentId}-18`,
      timestamp: new Date(baseTime - 27 * 1000).toISOString(),
      type: LOG_TYPES.WARNING,
      content: '[SERVER] Retrying payment gateway connection (attempt 1/3)',
      level: 'warning'
    },
    {
      id: `${agentId}-19`,
      timestamp: new Date(baseTime - 25 * 1000).toISOString(),
      type: LOG_TYPES.API_REQUEST,
      content: '[API] POST /api/v1/orders HTTP/1.1',
      level: 'info'
    },
    {
      id: `${agentId}-20`,
      timestamp: new Date(baseTime - 24 * 1000).toISOString(),
      type: LOG_TYPES.API_RESPONSE,
      content: '[API] Response 201 Created (843ms) - Order #54321 created successfully',
      level: 'info'
    },
    {
      id: `${agentId}-21`,
      timestamp: new Date(baseTime - 23 * 1000).toISOString(),
      type: LOG_TYPES.BOT_MESSAGE,
      content: '[TELEGRAM] Sent message to user: "תודה על הזמנתך! ההזמנה שלך (מספר #54321) התקבלה בהצלחה. קיבלת אישור במייל וההזמנה תישלח אליך תוך 3-5 ימי עסקים. האם אוכל לעזור לך בדבר נוסף?"',
      level: 'info'
    },
    {
      id: `${agentId}-22`,
      timestamp: new Date(baseTime - 10 * 1000).toISOString(),
      type: LOG_TYPES.USER_MESSAGE,
      content: '[TELEGRAM] Received message from user (id: 87654321): "לא תודה, זה הכל"',
      level: 'info'
    },
    {
      id: `${agentId}-23`,
      timestamp: new Date(baseTime - 9 * 1000).toISOString(),
      type: LOG_TYPES.DEBUG,
      content: '[OPENAI] Sending prompt to model gpt-4o with temperature=0.7, max_tokens=200',
      level: 'debug'
    },
    {
      id: `${agentId}-24`,
      timestamp: new Date(baseTime - 8 * 1000).toISOString(),
      type: LOG_TYPES.DEBUG,
      content: '[OPENAI] Received response from model (756ms, tokens: prompt=412, completion=87, total=499)',
      level: 'debug'
    },
    {
      id: `${agentId}-25`,
      timestamp: new Date(baseTime - 7 * 1000).toISOString(),
      type: LOG_TYPES.BOT_MESSAGE,
      content: '[TELEGRAM] Sent message to user: "מעולה! תודה שקנית אצלנו. אם תצטרך עזרה נוספת בעתיד, אל תהסס לפנות אלינו. יום נפלא!"',
      level: 'info'
    },
    {
      id: `${agentId}-26`,
      timestamp: new Date(baseTime - 5 * 1000).toISOString(),
      type: LOG_TYPES.INFO,
      content: '[MEMORY] Saving conversation history for session #12345 (25 messages)',
      level: 'info'
    },
    {
      id: `${agentId}-27`,
      timestamp: new Date(baseTime - 2 * 1000).toISOString(),
      type: LOG_TYPES.DEBUG,
      content: '[MEMORY] Memory usage: 256MB, Active sessions: 12, DB connections: 5',
      level: 'debug'
    }
  ];
};

// פונקציה להוספת לוג חדש בזמן אמת (סימולציה)
const generateNewLog = (agentId) => {
  const types = Object.values(LOG_TYPES);
  const randomType = types[Math.floor(Math.random() * types.length)];
  
  const descriptions = {
    [LOG_TYPES.INFO]: [
      '[SERVER] Checking bot health status - OK',
      '[MEMORY] Cleaning up expired sessions',
      '[SERVER] Current active users: 24',
      '[SYSTEM] Memory usage at 45%'
    ],
    [LOG_TYPES.DEBUG]: [
      '[OPENAI] Token usage this hour: 12,450/100,000',
      '[MEMORY] Session #12345 size: 24KB',
      '[TELEGRAM] Webhook response time: 124ms',
      '[SYSTEM] Database query executed in 56ms'
    ],
    [LOG_TYPES.WARNING]: [
      '[SERVER] High CPU usage detected (78%)',
      '[API] Slow response from product API (>1000ms)',
      '[MEMORY] Session cache nearing capacity (85%)',
      '[TELEGRAM] Message delivery delayed (retry 1/3)'
    ],
    [LOG_TYPES.ERROR]: [
      '[API] Failed to connect to payment gateway - timeout',
      '[SERVER] Database connection error - retrying',
      '[OPENAI] API rate limit exceeded',
      '[TELEGRAM] Failed to send message to user id 87654321'
    ],
    [LOG_TYPES.API_REQUEST]: [
      '[API] GET /api/v1/products?category=electronics&limit=10 HTTP/1.1',
      '[API] POST /api/v1/cart/add HTTP/1.1',
      '[API] GET /api/v1/user/87654321/history HTTP/1.1',
      '[API] PUT /api/v1/orders/54321/status HTTP/1.1'
    ],
    [LOG_TYPES.API_RESPONSE]: [
      '[API] Response 200 OK (187ms) - Returned 10 products',
      '[API] Response 201 Created (203ms) - Item added to cart',
      '[API] Response 404 Not Found (95ms) - User history not found',
      '[API] Response 204 No Content (124ms) - Order status updated'
    ],
    [LOG_TYPES.USER_MESSAGE]: [
      '[TELEGRAM] Received message from user (id: 87654321): "מה המחיר של מוצר X?"',
      '[TELEGRAM] Received message from user (id: 87654321): "האם יש לכם את זה במלאי?"',
      '[TELEGRAM] Received message from user (id: 87654321): "מתי ההזמנה שלי תגיע?"',
      '[TELEGRAM] Received message from user (id: 87654321): "תודה רבה!"'
    ],
    [LOG_TYPES.BOT_MESSAGE]: [
      '[TELEGRAM] Sent message to user: "המחיר של מוצר X הוא 199.99 ש"ח"',
      '[TELEGRAM] Sent message to user: "כן, המוצר נמצא במלאי ומוכן למשלוח מיידי"',
      '[TELEGRAM] Sent message to user: "ההזמנה שלך #54321 צפויה להגיע ב-3 ימי עסקים"',
      '[TELEGRAM] Sent message to user: "בשמחה! אם תצטרך עזרה נוספת, אני כאן"'
    ]
  };
  
  const randomDescription = descriptions[randomType][Math.floor(Math.random() * descriptions[randomType].length)];
  const level = randomType === LOG_TYPES.ERROR ? 'error' : 
                randomType === LOG_TYPES.WARNING ? 'warning' : 
                randomType === LOG_TYPES.DEBUG ? 'debug' : 'info';
  
  return {
    id: `${agentId}-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: randomType,
    content: randomDescription,
    level
  };
};

// פורמט תאריך לתצוגה
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
  
  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
};

export default function LogPanel({ agentId, isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [logLevel, setLogLevel] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = useRef(null);
  
  // טעינת לוגים ראשונית
  useEffect(() => {
    if (isOpen) {
      // סימולציה של טעינת נתונים מהשרת
      setIsLoading(true);
      setTimeout(() => {
        try {
          const initialLogs = generateDemoLogs(agentId);
          setLogs(initialLogs);
          setFilteredLogs(initialLogs);
          setIsLoading(false);
        } catch (err) {
          setError('שגיאה בטעינת הלוגים');
          setIsLoading(false);
        }
      }, 800);
      
      // סימולציה של קבלת לוגים בזמן אמת
      const interval = setInterval(() => {
        if (Math.random() > 0.7) { // 30% סיכוי להוספת לוג חדש
          const newLog = generateNewLog(agentId);
          setLogs(prevLogs => {
            const updatedLogs = [newLog, ...prevLogs];
            // עדכון הלוגים המסוננים בהתאם לפילטר הנוכחי
            if ((filter === 'all' || filter === newLog.type) && 
                (logLevel === 'all' || logLevel === newLog.level || 
                 (logLevel === 'info' && ['info', 'debug', 'warning', 'error'].includes(newLog.level)) ||
                 (logLevel === 'warning' && ['warning', 'error'].includes(newLog.level)) ||
                 (logLevel === 'debug' && ['debug', 'info', 'warning', 'error'].includes(newLog.level)))) {
              setFilteredLogs(prevFiltered => [newLog, ...prevFiltered]);
            }
            return updatedLogs;
          });
        }
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [agentId, isOpen, filter, logLevel]);
  
  // פילטור לוגים לפי סוג וחומרה
  useEffect(() => {
    let filtered = logs;
    
    // פילטור לפי סוג
    if (filter !== 'all') {
      filtered = filtered.filter(log => log.type === filter);
    }
    
    // פילטור לפי רמת חומרה
    if (logLevel !== 'all') {
      filtered = filtered.filter(log => {
        if (logLevel === 'error') return log.level === 'error';
        if (logLevel === 'warning') return ['warning', 'error'].includes(log.level);
        if (logLevel === 'info') return ['info', 'warning', 'error'].includes(log.level);
        if (logLevel === 'debug') return ['debug', 'info', 'warning', 'error'].includes(log.level);
        return true;
      });
    }
    
    setFilteredLogs(filtered);
  }, [filter, logLevel, logs]);
  
  // גלילה אוטומטית לתחתית הלוגים כשמתווסף לוג חדש
  useEffect(() => {
    if (logContainerRef.current && filteredLogs.length > 0 && autoScroll) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [filteredLogs.length, autoScroll]);
  
  // ניקוי לוגים
  const clearLogs = () => {
    setLogs([]);
    setFilteredLogs([]);
  };
  
  // ייצוא לוגים
  const exportLogs = () => {
    const logsText = logs.map(log => 
      `[${formatTimestamp(log.timestamp)}] [${log.level.toUpperCase()}] ${log.content}`
    ).join('\n');
    
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-${agentId}-logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // קבלת צבע לפי רמת חומרה
  const getLevelColor = (level) => {
    switch (level) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      case 'debug': return 'text-gray-500';
      default: return 'text-gray-800';
    }
  };
  
  return (
    <div 
      className={`bg-gray-900 border border-gray-700 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      {isOpen && (
        <div className="p-4">
          {/* כותרת וכפתורי פעולה */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-mono font-semibold text-gray-200">Console Output</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors duration-200 mr-2 ${
                  autoScroll ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-300'
                }`}
                title={autoScroll ? 'Auto-scroll enabled' : 'Auto-scroll disabled'}
              >
                Auto-scroll {autoScroll ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={clearLogs}
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded text-xs font-mono transition-colors duration-200 mr-2"
                title="Clear logs"
              >
                Clear
              </button>
              <button
                onClick={exportLogs}
                className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-mono transition-colors duration-200 mr-2"
                title="Export logs"
              >
                Export
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-200"
                title="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* פילטרים */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center">
              <span className="text-xs font-mono text-gray-400 mr-2">Type:</span>
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-gray-800 text-gray-200 text-xs font-mono rounded border border-gray-700 px-2 py-1"
              >
                <option value="all">All</option>
                <option value={LOG_TYPES.INFO}>INFO</option>
                <option value={LOG_TYPES.DEBUG}>DEBUG</option>
                <option value={LOG_TYPES.WARNING}>WARNING</option>
                <option value={LOG_TYPES.ERROR}>ERROR</option>
                <option value={LOG_TYPES.API_REQUEST}>API Request</option>
                <option value={LOG_TYPES.API_RESPONSE}>API Response</option>
                <option value={LOG_TYPES.USER_MESSAGE}>User Message</option>
                <option value={LOG_TYPES.BOT_MESSAGE}>Bot Message</option>
              </select>
            </div>
            
            <div className="flex items-center ml-4">
              <span className="text-xs font-mono text-gray-400 mr-2">Level:</span>
              <select 
                value={logLevel}
                onChange={(e) => setLogLevel(e.target.value)}
                className="bg-gray-800 text-gray-200 text-xs font-mono rounded border border-gray-700 px-2 py-1"
              >
                <option value="all">All</option>
                <option value="debug">Debug+</option>
                <option value="info">Info+</option>
                <option value="warning">Warning+</option>
                <option value="error">Error only</option>
              </select>
            </div>
          </div>
          
          {/* תוכן הלוגים */}
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-red-900 text-red-200 p-4 rounded-md font-mono text-sm">
              {error}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center text-gray-500 py-8 font-mono">
              No logs to display
            </div>
          ) : (
            <div 
              ref={logContainerRef}
              className="max-h-96 overflow-y-auto bg-gray-950 rounded-md p-2 font-mono text-xs"
              style={{ direction: 'ltr' }} // הלוגים מוצגים משמאל לימין
            >
              {filteredLogs.map(log => (
                <div 
                  key={log.id} 
                  className={`py-1 px-2 ${
                    log.level === 'error' ? 'bg-red-900 bg-opacity-20' : 
                    log.level === 'warning' ? 'bg-yellow-900 bg-opacity-10' : 
                    ''
                  } hover:bg-gray-800`}
                >
                  <span className="text-gray-500">[{formatTimestamp(log.timestamp)}]</span>{' '}
                  <span className={`font-semibold ${getLevelColor(log.level)}`}>
                    [{log.level.toUpperCase()}]
                  </span>{' '}
                  <span className="text-gray-200">{log.content}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 