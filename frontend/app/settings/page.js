'use client';

import { useState } from 'react';
import Navbar from '../../components/Navbar';

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    username: 'דני',
    email: 'dani@example.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    openaiApiKey: 'sk-*************************************',
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // נקה שגיאות בעת הקלדה
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'שם משתמש הוא שדה חובה';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'אימייל הוא שדה חובה';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'אנא הזן כתובת אימייל תקינה';
    }
    
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'יש להזין את הסיסמה הנוכחית';
      }
      
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'הסיסמה החדשה חייבת להכיל לפחות 6 תווים';
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'הסיסמאות אינן תואמות';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setSuccess('');
    setError('');
    
    try {
      // כאן יהיה קוד לעדכון ההגדרות מול ה-API
      console.log('עדכון הגדרות עם:', formData);
      
      // הדמיית עיכוב רשת
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess('ההגדרות נשמרו בהצלחה');
      
      // איפוס שדות סיסמה
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('שגיאה בעדכון הגדרות:', err);
      setError('אירעה שגיאה בשמירת ההגדרות. אנא נסה שנית.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleClearCache = async () => {
    setClearingCache(true);
    setSuccess('');
    setError('');
    
    try {
      // כאן יהיה קוד לריקון המטמון מול ה-API
      console.log('ריקון מטמון');
      
      // הדמיית עיכוב רשת
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess('המטמון רוקן בהצלחה');
    } catch (err) {
      console.error('שגיאה בריקון מטמון:', err);
      setError('אירעה שגיאה בריקון המטמון. אנא נסה שנית.');
    } finally {
      setClearingCache(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-foreground">הגדרות</h1>
        </div>
      </header>
      
      <main className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {success && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}
        
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              פרטי משתמש
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              עדכן את פרטי המשתמש שלך
            </p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  שם משתמש
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                />
                {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  אימייל
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-md font-medium text-gray-900 mb-3">שינוי סיסמה</h4>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      סיסמה נוכחית
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${errors.currentPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                    />
                    {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      סיסמה חדשה
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${errors.newPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                    />
                    {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      אימות סיסמה חדשה
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                    />
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-md font-medium text-gray-900 mb-3">הגדרות API</h4>
                
                <div>
                  <label htmlFor="openaiApiKey" className="block text-sm font-medium text-gray-700 mb-1">
                    OpenAI API Key
                  </label>
                  <input
                    type="text"
                    id="openaiApiKey"
                    name="openaiApiKey"
                    value={formData.openaiApiKey}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.openaiApiKey ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                    placeholder="sk-..."
                  />
                  {errors.openaiApiKey && <p className="mt-1 text-sm text-red-600">{errors.openaiApiKey}</p>}
                  <p className="mt-1 text-sm text-gray-500">
                    מפתח ה-API של OpenAI משמש לתקשורת עם הסוכנים
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-blue-600'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      שומר שינויים...
                    </>
                  ) : (
                    'שמור שינויים'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              תחזוקת מערכת
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              פעולות תחזוקה למערכת
            </p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">ריקון מטמון</h4>
                <p className="text-sm text-gray-500 mb-3">
                  ריקון המטמון יגרום לטעינה מחדש של כל הנתונים מהשרת. פעולה זו עשויה לעזור במקרה של בעיות בתצוגת הנתונים.
                </p>
                <button
                  type="button"
                  onClick={handleClearCache}
                  disabled={clearingCache}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    clearingCache ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                >
                  {clearingCache ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      מרוקן מטמון...
                    </>
                  ) : (
                    'רוקן מטמון'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 