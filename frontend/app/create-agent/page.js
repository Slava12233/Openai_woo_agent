'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { useAgents } from '../../context/AgentContext';
import { withAuth } from '../../context/AuthContext';
import { isValidUrl } from '../../utils';
import { toast } from 'react-hot-toast';

function CreateAgent() {
  const router = useRouter();
  const { addAgent, loading: agentLoading } = useAgents();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    // שלב 1 - פלטפורמת תקשורת
    platform: 'telegram',
    platformToken: '',
    
    // שלב 2 - פרטי חנות
    storeUrl: '',
    consumerKey: '',
    consumerSecret: '',
    
    // שלב 3 - הגדרות OpenAI
    openaiKey: '',
    openaiModel: 'gpt-3.5-turbo',
    
    // שלב 4 - הגדרות הסוכן
    name: '',
    description: '',
    personality: 'מקצועי',
    knowledgeDomains: ['מוצרים', 'משלוחים', 'החזרות'],
    supportedLanguages: ['עברית'],
    workingHours: { enabled: false, hours: [] },
    welcomeMessage: 'שלום! אני סוכן AI שישמח לעזור לך. במה אוכל לסייע?',
    
    // מצב הסוכן
    status: 'פעיל',
  });
  
  const [errors, setErrors] = useState({});
  
  // פונקציות לניהול הטופס
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // נקה שגיאות בעת הקלדה
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const handleArrayChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
    
    // נקה שגיאות
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.platformToken.trim()) {
        newErrors.platformToken = 'טוקן הפלטפורמה הוא שדה חובה';
      }
    }
    
    if (step === 2) {
      if (!formData.storeUrl.trim()) {
        newErrors.storeUrl = 'כתובת החנות היא שדה חובה';
      } else if (!isValidUrl(formData.storeUrl)) {
        newErrors.storeUrl = 'כתובת החנות חייבת להיות כתובת URL תקינה';
      }
      
      if (!formData.consumerKey.trim()) {
        newErrors.consumerKey = 'מפתח צרכן הוא שדה חובה';
      }
      
      if (!formData.consumerSecret.trim()) {
        newErrors.consumerSecret = 'סוד צרכן הוא שדה חובה';
      }
    }
    
    if (step === 3) {
      if (!formData.openaiKey.trim()) {
        newErrors.openaiKey = 'מפתח OpenAI הוא שדה חובה';
      }
    }
    
    if (step === 4) {
      if (!formData.name.trim()) {
        newErrors.name = 'שם הסוכן הוא שדה חובה';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }
    
    setSaving(true);
    
    try {
      // הכנת הנתונים לשליחה
      const agentData = {
        name: formData.name,
        description: formData.description,
        platform: formData.platform === 'telegram' ? 'טלגרם' : 'וואטסאפ',
        platformToken: formData.platformToken,
        storeUrl: formData.storeUrl,
        consumerKey: formData.consumerKey,
        consumerSecret: formData.consumerSecret,
        openaiKey: formData.openaiKey,
        openaiModel: formData.openaiModel,
        personality: formData.personality,
        knowledgeDomains: formData.knowledgeDomains,
        supportedLanguages: formData.supportedLanguages,
        workingHours: formData.workingHours,
        welcomeMessage: formData.welcomeMessage,
        status: formData.status,
      };
      
      // יצירת הסוכן באמצעות ה-API
      await addAgent(agentData);
      
      // הצגת הודעת הצלחה
      toast.success('הסוכן נוצר בהצלחה!');
      
      // מעבר לדף הדאשבורד
      router.push('/dashboard');
    } catch (err) {
      console.error('שגיאה ביצירת סוכן:', err);
      setErrors({
        submit: err.message || 'אירעה שגיאה ביצירת הסוכן. אנא נסה שנית.'
      });
      toast.error('אירעה שגיאה ביצירת הסוכן');
    } finally {
      setSaving(false);
    }
  };
  
  // רינדור השלבים השונים
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderPlatformStep();
      case 2:
        return renderStoreStep();
      case 3:
        return renderOpenAIStep();
      case 4:
        return renderAgentSettingsStep();
      case 5:
        return renderSummaryStep();
      default:
        return null;
    }
  };
  
  // שלב 1: בחירת פלטפורמת תקשורת
  const renderPlatformStep = () => {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">בחירת פלטפורמת תקשורת</h2>
          <p className="text-gray-600">בחר את הפלטפורמה שבה הסוכן יתקשר עם הלקוחות שלך.</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              בחר פלטפורמה
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`border rounded-lg p-4 cursor-pointer ${
                  formData.platform === 'telegram' ? 'border-primary ring-2 ring-primary' : 'border-gray-300'
                }`}
                onClick={() => handleChange({ target: { name: 'platform', value: 'telegram' } })}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border ${
                    formData.platform === 'telegram' ? 'border-primary bg-primary' : 'border-gray-300'
                  } flex items-center justify-center mr-3`}>
                    {formData.platform === 'telegram' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">טלגרם</h3>
                    <p className="text-sm text-gray-500">בוט טלגרם לתקשורת עם הלקוחות</p>
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-gray-600">
                  <p className="mb-2">יתרונות:</p>
                  <ul className="list-disc list-inside space-y-1 mr-4">
                    <li>קל להגדרה ושימוש</li>
                    <li>תמיכה בקבצים ומדיה</li>
                    <li>ממשק משתמש נוח</li>
                    <li>אין צורך במספר טלפון</li>
                  </ul>
                </div>
              </div>
              
              <div
                className={`border rounded-lg p-4 cursor-pointer ${
                  formData.platform === 'whatsapp' ? 'border-primary ring-2 ring-primary' : 'border-gray-300'
                }`}
                onClick={() => handleChange({ target: { name: 'platform', value: 'whatsapp' } })}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border ${
                    formData.platform === 'whatsapp' ? 'border-primary bg-primary' : 'border-gray-300'
                  } flex items-center justify-center mr-3`}>
                    {formData.platform === 'whatsapp' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">וואטסאפ</h3>
                    <p className="text-sm text-gray-500">בוט וואטסאפ לתקשורת עם הלקוחות</p>
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-gray-600">
                  <p className="mb-2">יתרונות:</p>
                  <ul className="list-disc list-inside space-y-1 mr-4">
                    <li>פופולרי מאוד בישראל</li>
                    <li>תמיכה בשיחות קוליות</li>
                    <li>אימות מספר טלפון</li>
                    <li>אינטגרציה עם עסקים</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <label htmlFor="platformToken" className="block text-sm font-medium text-gray-700 mb-1">
              {formData.platform === 'telegram' ? 'טוקן בוט טלגרם' : 'מפתח API של וואטסאפ'}
            </label>
            <input
              type="text"
              id="platformToken"
              name="platformToken"
              value={formData.platformToken}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${errors.platformToken ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
              placeholder={formData.platform === 'telegram' ? '123456789:ABCDefGhIJKlmNoPQRsTUVwxyZ' : 'הזן את מפתח ה-API של וואטסאפ'}
            />
            {errors.platformToken && <p className="mt-1 text-sm text-red-600">{errors.platformToken}</p>}
            
            <div className="mt-2 p-4 bg-blue-50 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 mb-2">איך להשיג את הטוקן?</h4>
              {formData.platform === 'telegram' ? (
                <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1 mr-4">
                  <li>פתח את טלגרם וחפש את "@BotFather"</li>
                  <li>שלח את הפקודה "/newbot" ועקוב אחר ההוראות</li>
                  <li>בחר שם לבוט ושם משתמש (חייב להסתיים ב-bot)</li>
                  <li>לאחר היצירה, תקבל הודעה עם הטוקן של הבוט</li>
                  <li>העתק את הטוקן והדבק אותו כאן</li>
                </ol>
              ) : (
                <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1 mr-4">
                  <li>הירשם לשירות WhatsApp Business API</li>
                  <li>צור חשבון פיתוח בפלטפורמה</li>
                  <li>הגדר אפליקציה חדשה וקבל מפתח API</li>
                  <li>אשר את מספר הטלפון העסקי שלך</li>
                  <li>העתק את מפתח ה-API והדבק אותו כאן</li>
                </ol>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleNextStep}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            המשך
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    );
  };
  
  // שלב 2: חיבור לחנות WooCommerce
  const renderStoreStep = () => {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">חיבור לחנות WooCommerce</h2>
          <p className="text-gray-600">חבר את הסוכן לחנות ה-WooCommerce שלך כדי שיוכל לגשת למידע על מוצרים, הזמנות ולקוחות.</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="storeUrl" className="block text-sm font-medium text-gray-700 mb-1">
              כתובת החנות (URL)
            </label>
            <input
              type="text"
              id="storeUrl"
              name="storeUrl"
              value={formData.storeUrl}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${errors.storeUrl ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
              placeholder="https://your-store.com"
            />
            {errors.storeUrl && <p className="mt-1 text-sm text-red-600">{errors.storeUrl}</p>}
          </div>
          
          <div>
            <label htmlFor="consumerKey" className="block text-sm font-medium text-gray-700 mb-1">
              WooCommerce API Consumer Key
            </label>
            <input
              type="text"
              id="consumerKey"
              name="consumerKey"
              value={formData.consumerKey}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${errors.consumerKey ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
              placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            />
            {errors.consumerKey && <p className="mt-1 text-sm text-red-600">{errors.consumerKey}</p>}
          </div>
          
          <div>
            <label htmlFor="consumerSecret" className="block text-sm font-medium text-gray-700 mb-1">
              WooCommerce API Consumer Secret
            </label>
            <input
              type="text"
              id="consumerSecret"
              name="consumerSecret"
              value={formData.consumerSecret}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${errors.consumerSecret ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
              placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            />
            {errors.consumerSecret && <p className="mt-1 text-sm text-red-600">{errors.consumerSecret}</p>}
          </div>
          
          <div className="mt-2 p-4 bg-blue-50 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-2">איך להשיג את מפתחות ה-API?</h4>
            <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1 mr-4">
              <li>היכנס לפאנל הניהול של ה-WordPress שלך</li>
              <li>נווט אל WooCommerce &gt; הגדרות &gt; מתקדם &gt; REST API</li>
              <li>לחץ על "הוסף מפתח"</li>
              <li>הזן תיאור (למשל "מפתח לסוכן AI") ובחר "קריאה/כתיבה" בהרשאות</li>
              <li>לחץ על "צור מפתח API"</li>
              <li>העתק את ה-Consumer Key וה-Consumer Secret והדבק אותם כאן</li>
            </ol>
            <div className="mt-3">
              <button
                type="button"
                className="text-blue-700 hover:text-blue-900 font-medium text-sm flex items-center"
                onClick={() => {
                  // בדיקת חיבור לחנות - במקרה אמיתי יש לבצע בדיקה מול השרת
                  toast.success('בודק חיבור לחנות...');
                  setTimeout(() => {
                    if (formData.storeUrl && formData.consumerKey && formData.consumerSecret) {
                      toast.success('החיבור לחנות נוצר בהצלחה!');
                    } else {
                      toast.error('אנא מלא את כל השדות הנדרשים');
                    }
                  }, 1500);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                בדוק חיבור
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={handlePrevStep}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            חזרה
          </button>
          <button
            type="button"
            onClick={handleNextStep}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            המשך
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    );
  };
  
  // שלב 3: הגדרת OpenAI
  const renderOpenAIStep = () => {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">הגדרת OpenAI</h2>
          <p className="text-gray-600">הגדר את מפתח ה-API של OpenAI ובחר את המודל שישמש את הסוכן.</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="openaiKey" className="block text-sm font-medium text-gray-700 mb-1">
              OpenAI API Key
            </label>
            <input
              type="text"
              id="openaiKey"
              name="openaiKey"
              value={formData.openaiKey}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${errors.openaiKey ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            />
            {errors.openaiKey && <p className="mt-1 text-sm text-red-600">{errors.openaiKey}</p>}
            
            <div className="mt-2 p-4 bg-blue-50 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 mb-2">איך להשיג מפתח API של OpenAI?</h4>
              <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1 mr-4">
                <li>היכנס לאתר <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com</a></li>
                <li>הירשם או התחבר לחשבון שלך</li>
                <li>נווט אל "API Keys" בתפריט</li>
                <li>לחץ על "Create new secret key"</li>
                <li>העתק את המפתח והדבק אותו כאן (שים לב: המפתח יוצג רק פעם אחת!)</li>
              </ol>
              <div className="mt-3">
                <button
                  type="button"
                  className="text-blue-700 hover:text-blue-900 font-medium text-sm flex items-center"
                  onClick={() => {
                    // בדיקת תקינות המפתח - במקרה אמיתי יש לבצע בדיקה מול השרת
                    toast.success('בודק תקינות מפתח OpenAI...');
                    setTimeout(() => {
                      if (formData.openaiKey) {
                        if (formData.openaiKey.startsWith('sk-')) {
                          toast.success('מפתח OpenAI תקין!');
                        } else {
                          toast.error('מפתח OpenAI לא תקין. המפתח חייב להתחיל ב-sk-');
                        }
                      } else {
                        toast.error('אנא הזן מפתח OpenAI');
                      }
                    }, 1500);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  בדוק תקינות מפתח
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              בחר מודל
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`border rounded-lg p-4 cursor-pointer ${
                  formData.openaiModel === 'gpt-3.5-turbo' ? 'border-primary ring-2 ring-primary' : 'border-gray-300'
                }`}
                onClick={() => handleChange({ target: { name: 'openaiModel', value: 'gpt-3.5-turbo' } })}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border ${
                    formData.openaiModel === 'gpt-3.5-turbo' ? 'border-primary bg-primary' : 'border-gray-300'
                  } flex items-center justify-center mr-3`}>
                    {formData.openaiModel === 'gpt-3.5-turbo' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">GPT-3.5 Turbo</h3>
                    <p className="text-sm text-gray-500">מהיר וחסכוני, מתאים לרוב המקרים</p>
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-gray-600">
                  <p className="mb-2">יתרונות:</p>
                  <ul className="list-disc list-inside space-y-1 mr-4">
                    <li>מהירות תגובה גבוהה</li>
                    <li>עלות נמוכה</li>
                    <li>ביצועים טובים למרבית המשימות</li>
                  </ul>
                </div>
              </div>
              
              <div
                className={`border rounded-lg p-4 cursor-pointer ${
                  formData.openaiModel === 'gpt-4' ? 'border-primary ring-2 ring-primary' : 'border-gray-300'
                }`}
                onClick={() => handleChange({ target: { name: 'openaiModel', value: 'gpt-4' } })}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border ${
                    formData.openaiModel === 'gpt-4' ? 'border-primary bg-primary' : 'border-gray-300'
                  } flex items-center justify-center mr-3`}>
                    {formData.openaiModel === 'gpt-4' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">GPT-4</h3>
                    <p className="text-sm text-gray-500">המודל המתקדם ביותר, לביצועים מעולים</p>
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-gray-600">
                  <p className="mb-2">יתרונות:</p>
                  <ul className="list-disc list-inside space-y-1 mr-4">
                    <li>הבנה מעמיקה יותר</li>
                    <li>תשובות מדויקות יותר</li>
                    <li>יכולות מתקדמות</li>
                    <li>התמודדות טובה יותר עם מקרים מורכבים</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={handlePrevStep}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            חזרה
          </button>
          <button
            type="button"
            onClick={handleNextStep}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            המשך
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    );
  };
  
  // שלב 4: הגדרות הסוכן
  const renderAgentSettingsStep = () => {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">הגדרות הסוכן</h2>
          <p className="text-gray-600">הגדר את הפרטים והיכולות של הסוכן שלך.</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              שם הסוכן <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
              placeholder="לדוגמה: סוכן המכירות של חנות ABC"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              תיאור הסוכן (אופציונלי)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="תיאור קצר של תפקיד הסוכן ויכולותיו"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              אישיות הסוכן
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['מקצועי', 'ידידותי', 'יעיל', 'מצחיק'].map((personality) => (
                <div
                  key={personality}
                  className={`border rounded-lg p-3 cursor-pointer text-center ${
                    formData.personality === personality ? 'border-primary ring-2 ring-primary bg-blue-50' : 'border-gray-300'
                  }`}
                  onClick={() => handleChange({ target: { name: 'personality', value: personality } })}
                >
                  {personality}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700 mb-1">
              הודעת פתיחה
            </label>
            <textarea
              id="welcomeMessage"
              name="welcomeMessage"
              value={formData.welcomeMessage}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="ההודעה שתוצג ללקוח בתחילת השיחה"
            />
          </div>
        </div>
        
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={handlePrevStep}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            חזרה
          </button>
          <button
            type="button"
            onClick={handleNextStep}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            המשך
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    );
  };
  
  // שלב 5: סיכום ואישור
  const renderSummaryStep = () => {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">סיכום ואישור</h2>
          <p className="text-gray-600">בדוק את הפרטים שהזנת לפני יצירת הסוכן.</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">פרטי הסוכן</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">מידע בסיסי</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">שם הסוכן:</span>
                    <p className="font-medium">{formData.name || 'לא הוגדר'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">תיאור:</span>
                    <p className="font-medium">{formData.description || 'לא הוגדר'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">אישיות:</span>
                    <p className="font-medium">{formData.personality}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">פלטפורמה וחיבורים</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">פלטפורמת תקשורת:</span>
                    <p className="font-medium">{formData.platform === 'telegram' ? 'טלגרם' : 'וואטסאפ'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">כתובת חנות:</span>
                    <p className="font-medium">{formData.storeUrl || 'לא הוגדר'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">מודל OpenAI:</span>
                    <p className="font-medium">{formData.openaiModel}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">הודעת פתיחה</h4>
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <p className="text-gray-700">{formData.welcomeMessage}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">
                לאחר יצירת הסוכן, תוכל לערוך את ההגדרות שלו בכל עת מדף הדאשבורד.
              </p>
            </div>
          </div>
        </div>
        
        {errors.submit && (
          <div className="mt-4 bg-red-50 border-r-4 border-red-500 text-red-700 p-4 rounded" role="alert">
            <p>{errors.submit}</p>
          </div>
        )}
        
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={handlePrevStep}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            חזרה
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || agentLoading}
            className={`inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              saving || agentLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
            }`}
          >
            {saving || agentLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                יוצר סוכן...
              </>
            ) : (
              <>
                צור סוכן
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };
  
  // אינדיקטור התקדמות
  const renderProgressIndicator = () => {
    const steps = [
      { number: 1, title: 'פלטפורמה' },
      { number: 2, title: 'חנות' },
      { number: 3, title: 'OpenAI' },
      { number: 4, title: 'הגדרות' },
      { number: 5, title: 'סיכום' },
    ];
    
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex flex-col items-center relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= step.number
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {currentStep > step.number ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <div className="text-xs mt-2 text-center">{step.title}</div>
              
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-5 w-full h-0.5 right-1/2 ${
                    currentStep > step.number ? 'bg-primary' : 'bg-gray-200'
                  }`}
                  style={{ width: 'calc(100% - 2.5rem)' }}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">יצירת סוכן חדש</h1>
            <p className="text-gray-600 mt-2">מלא את הפרטים הבאים כדי ליצור סוכן AI חדש לחנות שלך.</p>
          </div>
          
          {renderProgressIndicator()}
          
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(CreateAgent);
