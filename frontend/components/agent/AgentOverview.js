'use client';

import { useState } from 'react';
import { FaStore, FaRobot, FaComments, FaUsers, FaShoppingCart, FaShareAlt, FaQrcode, FaCopy, FaCheck } from 'react-icons/fa';
import { useAgents } from '../../context/AgentContext';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function AgentOverview({ agent }) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { fetchAgentShareLink, loading } = useAgents();
  const [shareData, setShareData] = useState(null);
  const [loadingShare, setLoadingShare] = useState(false);

  // סטטיסטיקות מדומות
  const stats = {
    totalConversations: 128,
    activeUsers: 42,
    responseTime: '45 שניות',
    satisfactionRate: '92%',
    messageCategories: [
      { name: 'שאלות על המוצרים', count: 12 },
      { name: 'שירות לקוחות', count: 8 },
      { name: 'מידע כללי', count: 5 }
    ]
  };

  const handleShareClick = async () => {
    try {
      setLoadingShare(true);
      const data = await fetchAgentShareLink(agent.id);
      setShareData(data);
      setShowQR(true);
    } catch (error) {
      console.error('שגיאה בקבלת קישור שיתוף:', error);
    } finally {
      setLoadingShare(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-8">
      {/* כרטיס מידע כללי */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <FaRobot className="ml-2 text-primary" />
            פרטי הסוכן
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-gray-500 text-sm">שם:</span>
              <p className="font-medium">{agent.name}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">תיאור:</span>
              <p>{agent.description || 'אין תיאור'}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">פלטפורמה:</span>
              <p className="font-medium">{agent.platform === 'telegram' ? 'טלגרם' : 'וואטסאפ'}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">מודל:</span>
              <p className="font-medium">{agent.model || 'GPT-3.5 Turbo'}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">נוצר בתאריך:</span>
              <p className="font-medium">
                {new Date(agent.createdAt || Date.now()).toLocaleDateString('he-IL')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <FaStore className="ml-2 text-primary" />
            פרטי החיבור לחנות
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-gray-500 text-sm">כתובת החנות:</span>
              <p className="font-medium">{agent.storeUrl}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">סוג החיבור:</span>
              <p className="font-medium">API ישיר</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">הרשאות:</span>
              <p className="font-medium">קריאה בלבד</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">סטטוס חיבור:</span>
              <div className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 ml-2"></span>
                <p className="font-medium text-green-600">מחובר</p>
              </div>
            </div>
            <div>
              <span className="text-gray-500 text-sm">עדכון אחרון:</span>
              <p className="font-medium">לפני 2 שעות</p>
            </div>
          </div>
        </div>
      </div>

      {/* סטטיסטיקות */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-bold mb-6 flex items-center">
          <FaComments className="ml-2 text-primary" />
          סטטיסטיקות ביצועים
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <FaComments className="mx-auto text-blue-500 text-xl mb-2" />
            <p className="text-sm text-gray-500">שיחות</p>
            <p className="text-xl font-bold">{stats.totalConversations}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <FaUsers className="mx-auto text-green-500 text-xl mb-2" />
            <p className="text-sm text-gray-500">משתמשים פעילים</p>
            <p className="text-xl font-bold">{stats.activeUsers}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <FaRobot className="mx-auto text-purple-500 text-xl mb-2" />
            <p className="text-sm text-gray-500">זמן תגובה</p>
            <p className="text-xl font-bold">{stats.responseTime}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <FaCheck className="mx-auto text-teal-500 text-xl mb-2" />
            <p className="text-sm text-gray-500">שביעות רצון</p>
            <p className="text-xl font-bold">{stats.satisfactionRate}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">קטגוריות שיחה נפוצות</h4>
            <ul className="space-y-2">
              {stats.messageCategories.map((category, index) => (
                <li key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span>{category.name}</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {category.count} שיחות
                  </span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">נתונים נוספים</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span>זמן שיחה ממוצע</span>
                <span className="font-medium">3 דקות</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span>שיחות פעילות כעת</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span>שאלות נפוצות</span>
                <span className="font-medium">12</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* שיתוף הסוכן */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <FaShareAlt className="ml-2 text-primary" />
          שיתוף הסוכן
        </h3>
        
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <button
            onClick={handleShareClick}
            disabled={loadingShare}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md flex items-center justify-center transition-colors"
          >
            {loadingShare ? (
              <>
                <LoadingSpinner size="small" className="ml-2" />
                טוען...
              </>
            ) : (
              <>
                <FaQrcode className="ml-2" />
                הצג קוד QR
              </>
            )}
          </button>
          
          {showQR && shareData && (
            <div className="mt-4 md:mt-0">
              <div className="flex items-center mb-2">
                <input
                  type="text"
                  value={shareData.shareLink}
                  readOnly
                  className="flex-grow p-2 border border-gray-300 rounded-md ml-2"
                />
                <button
                  onClick={() => copyToClipboard(shareData.shareLink)}
                  className="bg-gray-200 hover:bg-gray-300 p-2 rounded-md transition-colors"
                  title="העתק קישור"
                >
                  {copied ? <FaCheck className="text-green-500" /> : <FaCopy />}
                </button>
              </div>
              
              <div className="mt-4 flex justify-center">
                {shareData.qrCode && (
                  <img
                    src={`data:image/png;base64,${shareData.qrCode}`}
                    alt="QR Code"
                    className="w-48 h-48 border border-gray-200 rounded-md"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 