'use client';

import { useState } from 'react';
import { FaCog, FaSave, FaExclamationTriangle, FaCheck, FaTemperatureHigh, FaRobot, FaKey, FaTrash } from 'react-icons/fa';
import { useAgents } from '../../context/AgentContext';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function AgentAdvancedSettings({ agent }) {
  const { editAgent, deleteAgent, loading } = useAgents();
  const [settings, setSettings] = useState({
    temperature: agent.temperature || 0.7,
    maxTokens: agent.maxTokens || 2048,
    topP: agent.topP || 1,
    frequencyPenalty: agent.frequencyPenalty || 0,
    presencePenalty: agent.presencePenalty || 0,
    apiKey: agent.apiKey || '',
    model: agent.model || 'gpt-3.5-turbo',
    systemPrompt: agent.systemPrompt || ''
  });
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // המרת ערכים מספריים
    if (['temperature', 'maxTokens', 'topP', 'frequencyPenalty', 'presencePenalty'].includes(name)) {
      setSettings({
        ...settings,
        [name]: parseFloat(value)
      });
    } else {
      setSettings({
        ...settings,
        [name]: value
      });
    }
  };

  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');
      
      await editAgent(agent.id, settings);
      
      setSuccess('ההגדרות נשמרו בהצלחה');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('שגיאה בשמירת ההגדרות:', err);
      setError('אירעה שגיאה בשמירת ההגדרות');
    }
  };

  const handleDeleteAgent = async () => {
    try {
      setError('');
      
      await deleteAgent(agent.id);
      
      // הניווט לדאשבורד יתבצע בתוך פונקציית deleteAgent
    } catch (err) {
      console.error('שגיאה במחיקת הסוכן:', err);
      setError('אירעה שגיאה במחיקת הסוכן');
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-bold mb-4 flex items-center text-black">
          <FaRobot className="ml-2 text-gray-600" />
          הגדרות מודל
        </h3>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4 flex items-start">
            <FaExclamationTriangle className="text-red-500 mt-1 ml-2 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4 flex items-start">
            <FaCheck className="text-green-500 mt-1 ml-2 flex-shrink-0" />
            <p className="text-green-700">{success}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">מודל</label>
            <select
              name="model"
              value={settings.model}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
            >
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              בחר את המודל שהסוכן ישתמש בו. מודלים מתקדמים יותר עשויים להיות יקרים יותר.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                <FaTemperatureHigh className="ml-1" />
                טמפרטורה
              </div>
            </label>
            <div className="flex items-center">
              <input
                type="range"
                name="temperature"
                min="0"
                max="2"
                step="0.1"
                value={settings.temperature}
                onChange={handleChange}
                className="w-full"
              />
              <span className="ml-2 w-10 text-center">{settings.temperature}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ערך נמוך (0) יוצר תשובות יותר צפויות, ערך גבוה (2) יוצר תשובות יותר יצירתיות.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">מקסימום טוקנים</label>
            <input
              type="number"
              name="maxTokens"
              min="1"
              max="4096"
              value={settings.maxTokens}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
            />
            <p className="text-xs text-gray-500 mt-1">
              מספר הטוקנים המקסימלי שהמודל יכול להשתמש בתשובה.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Top P</label>
            <div className="flex items-center">
              <input
                type="range"
                name="topP"
                min="0"
                max="1"
                step="0.05"
                value={settings.topP}
                onChange={handleChange}
                className="w-full"
              />
              <span className="ml-2 w-10 text-center">{settings.topP}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              מגביל את הבחירה לטוקנים הסבירים ביותר. ערך נמוך יותר מגביל יותר.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency Penalty</label>
            <div className="flex items-center">
              <input
                type="range"
                name="frequencyPenalty"
                min="-2"
                max="2"
                step="0.1"
                value={settings.frequencyPenalty}
                onChange={handleChange}
                className="w-full"
              />
              <span className="ml-2 w-10 text-center">{settings.frequencyPenalty}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              מפחית את הסיכוי לחזרה על אותן מילים. ערך גבוה יותר מעודד גיוון.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Presence Penalty</label>
            <div className="flex items-center">
              <input
                type="range"
                name="presencePenalty"
                min="-2"
                max="2"
                step="0.1"
                value={settings.presencePenalty}
                onChange={handleChange}
                className="w-full"
              />
              <span className="ml-2 w-10 text-center">{settings.presencePenalty}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              מעודד את המודל לדבר על נושאים חדשים. ערך גבוה יותר מעודד חדשנות.
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt</label>
          <textarea
            name="systemPrompt"
            value={settings.systemPrompt}
            onChange={handleChange}
            rows={5}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
            placeholder="הזן כאן הנחיות מערכת מתקדמות..."
          />
          <p className="text-xs text-gray-500 mt-1">
            הנחיות מערכת מתקדמות שיועברו למודל. השתמש בזה רק אם אתה יודע מה אתה עושה.
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-bold mb-4 flex items-center text-black">
          <FaKey className="ml-2 text-gray-600" />
          הגדרות API
        </h3>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">מפתח API מותאם אישית (אופציונלי)</label>
          <input
            type="password"
            name="apiKey"
            value={settings.apiKey}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
            placeholder="sk-..."
          />
          <p className="text-xs text-gray-500 mt-1">
            אם ברצונך להשתמש במפתח API משלך במקום במפתח המערכת, הזן אותו כאן.
          </p>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center transition-colors"
        >
          <FaTrash className="ml-2" />
          מחק סוכן
        </button>
        
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md flex items-center transition-colors"
        >
          {loading ? (
            <>
              <LoadingSpinner size="small" className="ml-2" />
              שומר...
            </>
          ) : (
            <>
              <FaSave className="ml-2" />
              שמור הגדרות
            </>
          )}
        </button>
      </div>
      
      {/* חלונית אישור מחיקה */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-red-600">מחיקת סוכן</h3>
            <p className="mb-6 text-gray-800">
              האם אתה בטוח שברצונך למחוק את הסוכן? פעולה זו אינה ניתנת לביטול וכל הנתונים הקשורים לסוכן יימחקו לצמיתות.
            </p>
            <div className="flex justify-end space-x-4 rtl:space-x-reverse">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-800"
              >
                ביטול
              </button>
              <button
                onClick={handleDeleteAgent}
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                {loading ? <LoadingSpinner size="small" /> : 'מחק לצמיתות'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 