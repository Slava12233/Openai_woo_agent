'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import { useAgents } from '../../../context/AgentContext';
import { withAuth } from '../../../context/AuthContext';
import { isValidUrl } from '../../../utils';
import { toast } from 'react-hot-toast';

function EditAgent({ params }) {
  const router = useRouter();
  const { id } = params;
  const { fetchAgentById, editAgent, loading: agentLoading } = useAgents();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    // שלב 1 - פרטי חנות
    name: '',
    storeUrl: '',
    consumerKey: '',
    consumerSecret: '',
    
    // שלב 2 - ערוץ תקשורת
    platform: 'telegram', // telegram או whatsapp
    status: 'פעיל',
  });
  
  const [errors, setErrors] = useState({});
  
  // טעינת נתוני הסוכן הקיים
  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        const agent = await fetchAgentById(id);
        if (agent) {
          setFormData(agent);
        } else {
          toast.error('לא נמצא סוכן עם המזהה שצוין');
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('שגיאה בטעינת נתוני הסוכן:', err);
        toast.error('אירעה שגיאה בטעינת נתוני הסוכן');
      } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
  }, [id, fetchAgentById, router]);
  
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
  
  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'שם הסוכן הוא שדה חובה';
      }
      
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }
    
    setSaving(true);
    
    try {
      // עדכון הסוכן באמצעות ה-API
      await editAgent(id, formData);
      
      // הצגת הודעת הצלחה
      toast.success('הסוכן עודכן בהצלחה!');
      
      // חזרה לדף הדאשבורד
      router.push('/dashboard');
    } catch (err) {
      console.error('שגיאה בעדכון סוכן:', err);
      setErrors({
        submit: err.message || 'אירעה שגיאה בעדכון הסוכן. אנא נסה שנית.'
      });
      toast.error('אירעה שגיאה בעדכון הסוכן');
    } finally {
      setSaving(false);
    }
  };
  
  // יצירת לינק לשיתוף
  const shareLink = `https://t.me/your_bot?start=${id}`;
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-foreground">עריכת סוכן</h1>
          </div>
        </header>
        
        <main className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-center items-center h-32">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="text-lg text-gray-700">טוען נתונים...</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-foreground">עריכת סוכן</h1>
        </div>
      </header>
      
      <main className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* אינדיקטור שלבים */}
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {currentStep === 1 ? 'פרטי חנות' : 'בחירת ערוץ תקשורת'}
              </h3>
              <div className="flex items-center">
                <span className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </span>
                <div className={`w-10 h-1 ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                <span className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </span>
              </div>
            </div>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            {/* שלב 1 - פרטי חנות */}
            {currentStep === 1 && (
              <div>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      שם הסוכן
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                      placeholder="הזן שם לזיהוי הסוכן"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>
                  
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
                    <p className="mt-1 text-sm text-gray-500">
                      <a href="#" className="text-primary hover:text-blue-700" target="_blank" rel="noopener noreferrer">
                        איך להשיג את מפתחות ה-API?
                      </a>
                    </p>
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
            )}
            
            {/* שלב 2 - ערוץ תקשורת */}
            {currentStep === 2 && (
              <div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      בחר ערוץ תקשורת
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
                            <h3 className="text-lg font-medium text-gray-900">ווצאפ</h3>
                            <p className="text-sm text-gray-500">בוט ווצאפ לתקשורת עם הלקוחות</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      סטטוס הסוכן
                    </label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        className={`border rounded-lg p-4 cursor-pointer ${
                          formData.status === 'פעיל' ? 'border-primary ring-2 ring-primary' : 'border-gray-300'
                        }`}
                        onClick={() => handleChange({ target: { name: 'status', value: 'פעיל' } })}
                      >
                        <div className="flex items-center">
                          <div className={`w-5 h-5 rounded-full border ${
                            formData.status === 'פעיל' ? 'border-primary bg-primary' : 'border-gray-300'
                          } flex items-center justify-center mr-3`}>
                            {formData.status === 'פעיל' && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">פעיל</h3>
                            <p className="text-sm text-gray-500">הסוכן פעיל ומגיב להודעות</p>
                          </div>
                        </div>
                      </div>
                      
                      <div
                        className={`border rounded-lg p-4 cursor-pointer ${
                          formData.status === 'מושבת' ? 'border-primary ring-2 ring-primary' : 'border-gray-300'
                        }`}
                        onClick={() => handleChange({ target: { name: 'status', value: 'מושבת' } })}
                      >
                        <div className="flex items-center">
                          <div className={`w-5 h-5 rounded-full border ${
                            formData.status === 'מושבת' ? 'border-primary bg-primary' : 'border-gray-300'
                          } flex items-center justify-center mr-3`}>
                            {formData.status === 'מושבת' && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">מושבת</h3>
                            <p className="text-sm text-gray-500">הסוכן מושבת ואינו מגיב להודעות</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      שיתוף הסוכן
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        readOnly
                        value={shareLink}
                        className="px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent flex-grow"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(shareLink);
                          toast.success('הלינק הועתק בהצלחה!');
                        }}
                        className="px-4 py-2 bg-primary text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      >
                        העתק
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
                  <div className="flex space-x-3">
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ml-3"
                    >
                      ביטול
                    </Link>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={saving}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                        saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-blue-600'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
                    >
                      {saving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          שומר שינויים...
                        </>
                      ) : (
                        <>
                          שמור שינויים
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// עטיפת הקומפוננטה ב-withAuth כדי להגן על הדף
export default withAuth(EditAgent);
