'use client';

import { useState, useEffect } from 'react';
import { FaDownload, FaTrash, FaFilter, FaInfoCircle, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';
import LoadingSpinner from '../ui/LoadingSpinner';

// מיפוי סוגי לוגים לאייקונים וצבעים
const LOG_TYPES = {
  info: { icon: <FaInfoCircle className="text-blue-500" />, bgColor: 'bg-blue-50' },
  error: { icon: <FaExclamationCircle className="text-red-500" />, bgColor: 'bg-red-50' },
  success: { icon: <FaCheckCircle className="text-green-500" />, bgColor: 'bg-green-50' },
};

export default function AgentLogs({ agent }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedLog, setExpandedLog] = useState(null);

  // מדמה טעינת לוגים מהשרת
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        // בשלב זה נשתמש בנתונים מדומים
        // במימוש אמיתי, כאן יהיה קריאה ל-API
        await new Promise(resolve => setTimeout(resolve, 1000)); // מדמה עיכוב רשת
        
        const mockLogs = generateMockLogs(agent.id);
        setLogs(mockLogs);
      } catch (error) {
        console.error('שגיאה בטעינת הלוגים:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [agent.id]);

  // פונקציה ליצירת לוגים מדומים
  const generateMockLogs = (agentId) => {
    const types = ['info', 'error', 'success'];
    const actions = [
      'קבלת הודעה מלקוח',
      'שליחת תשובה ללקוח',
      'בדיקת מלאי מוצר',
      'עדכון סטטוס הזמנה',
      'חיפוש מוצרים',
      'בדיקת מחיר מוצר',
      'התחברות לחנות',
      'ניתוח שאלת לקוח',
      'יצירת המלצת מוצר'
    ];
    
    const mockLogs = [];
    const now = new Date();
    
    // יצירת 20 לוגים מדומים
    for (let i = 0; i < 20; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const timestamp = new Date(now - Math.floor(Math.random() * 24 * 60 * 60 * 1000));
      
      mockLogs.push({
        id: `log-${agentId}-${i}`,
        type,
        action,
        timestamp,
        details: `פרטים מורחבים על הפעולה: ${action}. כאן יופיע מידע נוסף על הפעולה שבוצעה, כולל נתונים טכניים ומידע על התוצאה.`,
      });
    }
    
    // מיון לפי זמן (מהחדש לישן)
    return mockLogs.sort((a, b) => b.timestamp - a.timestamp);
  };

  // פונקציה לניקוי הלוגים
  const clearLogs = () => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את כל הלוגים?')) {
      setLogs([]);
    }
  };

  // פונקציה לייצוא הלוגים ל-JSON
  const exportLogs = () => {
    const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.type === filter);
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `${agent.name}-logs-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // פונקציה לסינון הלוגים
  const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.type === filter);

  // פונקציה לפורמט תאריך
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner />
        <span className="mr-2">טוען לוגים...</span>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <FaInfoCircle className="mx-auto text-gray-400 text-4xl mb-4" />
        <h3 className="text-xl font-medium text-gray-700 mb-2">אין לוגים זמינים</h3>
        <p className="text-gray-500">לא נמצאו רשומות לוג עבור סוכן זה.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* כותרת וכלים */}
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h2 className="text-xl font-bold">לוגים ופעילות</h2>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">כל הלוגים</option>
              <option value="info">מידע</option>
              <option value="error">שגיאות</option>
              <option value="success">הצלחות</option>
            </select>
            <FaFilter className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
          </div>
          <button
            onClick={exportLogs}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md flex items-center transition-colors"
          >
            <FaDownload className="ml-2" />
            ייצוא
          </button>
          <button
            onClick={clearLogs}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md flex items-center transition-colors"
          >
            <FaTrash className="ml-2" />
            ניקוי
          </button>
        </div>
      </div>

      {/* טבלת לוגים */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  זמן
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  סוג
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  פעולה
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  פרטים
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr 
                  key={log.id} 
                  className={`${LOG_TYPES[log.type].bgColor} hover:bg-gray-50 cursor-pointer transition-colors`}
                  onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {LOG_TYPES[log.type].icon}
                      <span className="mr-2 text-sm">
                        {log.type === 'info' && 'מידע'}
                        {log.type === 'error' && 'שגיאה'}
                        {log.type === 'success' && 'הצלחה'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-primary hover:text-primary-dark">
                      הצג פרטים
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* תצוגת פרטים מורחבים */}
        {expandedLog && (
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <h4 className="font-medium mb-2">פרטים מורחבים:</h4>
            <p className="text-gray-700">
              {logs.find(log => log.id === expandedLog)?.details}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 