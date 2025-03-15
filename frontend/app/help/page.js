'use client';

import { useState } from 'react';
import Navbar from '../../components/Navbar';

export default function Help() {
  const [activeTab, setActiveTab] = useState('videos');
  const [expandedFaq, setExpandedFaq] = useState(null);
  
  const toggleFaq = (index) => {
    if (expandedFaq === index) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(index);
    }
  };
  
  const faqs = [
    {
      question: 'מה זה WooCommerce AI Agent?',
      answer: 'WooCommerce AI Agent הוא סוכן חכם המאפשר ללקוחות שלך לתקשר עם חנות ה-WooCommerce שלך באמצעות צ\'אט בטלגרם או בווצאפ. הסוכן יכול לענות על שאלות, לחפש מוצרים, להציג מידע על הזמנות ועוד.'
    },
    {
      question: 'איך הסוכן עובד?',
      answer: 'הסוכן משתמש ב-API של WooCommerce כדי לגשת לנתוני החנות שלך, וב-API של OpenAI כדי להבין את השאלות של הלקוחות ולספק תשובות רלוונטיות. הסוכן מתחבר לחנות שלך באמצעות מפתחות ה-API של WooCommerce, ומתקשר עם הלקוחות באמצעות בוט טלגרם או ווצאפ.'
    },
    {
      question: 'האם הסוכן בטוח לשימוש?',
      answer: 'כן, הסוכן בטוח לשימוש. הוא משתמש במפתחות ה-API של WooCommerce שלך, שניתן להגביל את ההרשאות שלהם לקריאה בלבד. בנוסף, הסוכן לא שומר מידע רגיש כמו פרטי כרטיסי אשראי.'
    },
    {
      question: 'כמה סוכנים אני יכול ליצור?',
      answer: 'אתה יכול ליצור כמה סוכנים שתרצה, לכל חנות או לקוח. אין הגבלה על מספר הסוכנים שניתן ליצור.'
    },
    {
      question: 'האם הסוכן תומך בשפות שונות?',
      answer: 'כן, הסוכן תומך בעברית ובאנגלית. הוא יזהה אוטומטית את השפה שבה הלקוח פונה אליו ויענה באותה שפה.'
    },
    {
      question: 'איך אני יכול לשתף את הסוכן עם הלקוחות שלי?',
      answer: 'לאחר יצירת הסוכן, תקבל לינק שאותו תוכל לשתף עם הלקוחות שלך. הלקוחות יכולים ללחוץ על הלינק כדי להתחיל לדבר עם הסוכן בטלגרם או בווצאפ.'
    },
    {
      question: 'האם אני צריך לשלם עבור השימוש ב-OpenAI API?',
      answer: 'כן, השימוש ב-OpenAI API כרוך בתשלום. אתה צריך להירשם ל-OpenAI ולקבל מפתח API משלך. התשלום הוא לפי השימוש, ובדרך כלל עולה כמה סנטים לכל אינטראקציה עם הסוכן.'
    },
    {
      question: 'מה קורה אם יש בעיה עם הסוכן?',
      answer: 'אם יש בעיה עם הסוכן, אתה יכול לנסות לרוקן את המטמון בדף ההגדרות. אם זה לא עוזר, אתה יכול ליצור קשר עם התמיכה שלנו באמצעות טופס יצירת הקשר בתחתית דף זה.'
    }
  ];
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-foreground">מדריכים ותמיכה</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'videos'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('videos')}
              >
                מדריכי וידאו
              </button>
              <button
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'guide'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('guide')}
              >
                מדריך שימוש
              </button>
              <button
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'faq'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('faq')}
              >
                שאלות נפוצות
              </button>
              <button
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'contact'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('contact')}
              >
                יצירת קשר
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {/* מדריכי וידאו */}
            {activeTab === 'videos' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">מדריכי וידאו</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg overflow-hidden shadow">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                      {/* כאן יהיה וידאו מוטמע */}
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="mt-2 text-gray-500">וידאו לדוגמה</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900">איך להשיג WooCommerce API Keys</h3>
                      <p className="mt-1 text-sm text-gray-500">מדריך מפורט להשגת מפתחות ה-API של WooCommerce לחיבור הסוכן לחנות שלך.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg overflow-hidden shadow">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                      {/* כאן יהיה וידאו מוטמע */}
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="mt-2 text-gray-500">וידאו לדוגמה</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900">איך ליצור סוכן חדש</h3>
                      <p className="mt-1 text-sm text-gray-500">מדריך מפורט ליצירת סוכן חדש ושיתופו עם הלקוחות שלך.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* מדריך שימוש */}
            {activeTab === 'guide' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">מדריך שימוש</h2>
                
                <div className="prose max-w-none">
                  <h3>איך ליצור סוכן ללקוחות</h3>
                  <p>
                    יצירת סוכן חדש היא תהליך פשוט שמורכב משלושה שלבים עיקריים. להלן מדריך מפורט:
                  </p>
                  
                  <h4>שלב 1: הכנת החנות</h4>
                  <p>
                    לפני שתוכל ליצור סוכן, עליך להשיג את מפתחות ה-API של WooCommerce מהחנות שלך:
                  </p>
                  <ol>
                    <li>היכנס לפאנל הניהול של WordPress בחנות שלך.</li>
                    <li>עבור ל-WooCommerce &gt; הגדרות &gt; מתקדם &gt; REST API.</li>
                    <li>לחץ על "הוסף מפתח".</li>
                    <li>הזן תיאור (לדוגמה: "AI Agent") ובחר ברמת הרשאה "קריאה/כתיבה".</li>
                    <li>לחץ על "צור מפתח API".</li>
                    <li>העתק את ה-Consumer Key וה-Consumer Secret שנוצרו. תצטרך אותם בשלב הבא.</li>
                  </ol>
                  
                  <h4>שלב 2: יצירת הסוכן</h4>
                  <p>
                    עכשיו שיש לך את מפתחות ה-API, אתה יכול ליצור את הסוכן:
                  </p>
                  <ol>
                    <li>בלוח הבקרה, לחץ על כפתור "יצירת סוכן חדש".</li>
                    <li>הזן שם לסוכן (לדוגמה: "סוכן חנות הבגדים").</li>
                    <li>הזן את כתובת ה-URL של החנות שלך.</li>
                    <li>הזן את ה-Consumer Key וה-Consumer Secret שהעתקת בשלב הקודם.</li>
                    <li>לחץ על "המשך".</li>
                    <li>בחר את ערוץ התקשורת המועדף (טלגרם או ווצאפ).</li>
                    <li>לחץ על "יצירת סוכן".</li>
                  </ol>
                  
                  <h4>שלב 3: שיתוף הסוכן עם הלקוחות</h4>
                  <p>
                    לאחר יצירת הסוכן, תקבל לינק שאותו תוכל לשתף עם הלקוחות שלך:
                  </p>
                  <ol>
                    <li>העתק את הלינק שמופיע במסך הסיום.</li>
                    <li>שתף את הלינק עם הלקוחות שלך באמצעות אימייל, הודעת טקסט, או כל דרך אחרת.</li>
                    <li>כאשר לקוח לוחץ על הלינק, הוא יועבר לצ'אט עם הסוכן בטלגרם או בווצאפ (בהתאם לבחירה שלך).</li>
                    <li>הלקוח יכול להתחיל לשאול שאלות ולקבל מידע על החנות והמוצרים שלך.</li>
                  </ol>
                  
                  <h3>טיפים לשימוש יעיל</h3>
                  <ul>
                    <li>ודא שהמוצרים בחנות שלך מכילים תיאורים מפורטים ותמונות איכותיות, כדי שהסוכן יוכל לספק מידע מדויק ללקוחות.</li>
                    <li>עדכן את הסוכן כאשר יש שינויים משמעותיים בחנות שלך, כמו שינוי כתובת ה-URL או החלפת מפתחות ה-API.</li>
                    <li>בדוק את הסוכן מדי פעם כדי לוודא שהוא עובד כראוי ומספק מידע מדויק.</li>
                    <li>אם יש בעיות בתפקוד הסוכן, נסה לרוקן את המטמון בדף ההגדרות.</li>
                  </ul>
                </div>
              </div>
            )}
            
            {/* שאלות נפוצות */}
            {activeTab === 'faq' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">שאלות נפוצות</h2>
                
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        className="w-full px-4 py-3 text-right flex justify-between items-center focus:outline-none"
                        onClick={() => toggleFaq(index)}
                      >
                        <span className="font-medium text-gray-900">{faq.question}</span>
                        <svg
                          className={`h-5 w-5 text-gray-500 transform ${expandedFaq === index ? 'rotate-180' : ''}`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {expandedFaq === index && (
                        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                          <p className="text-gray-700">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* יצירת קשר */}
            {activeTab === 'contact' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">יצירת קשר</h2>
                
                <p className="mb-6 text-gray-700">
                  אם יש לך שאלות או בעיות שלא מכוסות במדריכים או בשאלות הנפוצות, אתה מוזמן ליצור איתנו קשר באמצעות הטופס הבא:
                </p>
                
                <form className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      שם מלא
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="הזן את שמך המלא"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      אימייל
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="הזן את כתובת האימייל שלך"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      נושא
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="הזן את נושא הפנייה"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      הודעה
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="הזן את הודעתך"
                    ></textarea>
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      שלח הודעה
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 