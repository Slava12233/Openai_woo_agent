'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// סוגי סוכנים אפשריים
const AGENT_TYPES = {
  SALES: 'sales',
  SUPPORT: 'support',
  PRODUCT: 'product',
  GENERAL: 'general'
};

// תסריטי דמו מובנים לפי סוג סוכן
const DEMO_SCRIPTS = {
  [AGENT_TYPES.SALES]: [
    { role: 'user', content: 'שלום, אני מחפש מוצר חדש לסלון שלי' },
    { role: 'agent', content: 'שלום! אשמח לעזור לך למצוא את המוצר המושלם לסלון שלך. איזה סוג של מוצר אתה מחפש?' },
    { role: 'user', content: 'אני מחפש שולחן קפה מודרני' },
    { role: 'agent', content: 'מעולה! יש לנו מבחר שולחנות קפה מודרניים. מה התקציב שלך?' },
    { role: 'user', content: 'עד 500 ש"ח' },
    { role: 'agent', content: 'נהדר, יש לנו כמה אפשרויות בטווח הזה. הנה שלוש המלצות פופולריות:\n\n1. שולחן MODERN - 450 ש"ח\n2. שולחן ELEGANCE - 399 ש"ח\n3. שולחן MINIMALIST - 499 ש"ח\n\nהאם אחד מהם מעניין אותך?' },
    { role: 'user', content: 'אני אשמח לראות את שולחן ELEGANCE' },
    { role: 'agent', content: 'בחירה מצוינת! הנה קישור לשולחן ELEGANCE:\nhttps://store.example.com/products/elegance-table\n\nהוא מגיע בשלושה צבעים: שחור, לבן ואגוז. איזה צבע היית מעדיף?' },
    { role: 'user', content: 'אני אקח את הלבן. האם יש משלוח חינם?' },
    { role: 'agent', content: 'מצוין! כן, יש לנו משלוח חינם להזמנות מעל 300 ש"ח, כך שההזמנה שלך כוללת משלוח חינם!\n\nהמשלוח יגיע תוך 3-5 ימי עסקים. האם תרצה להמשיך להזמנה?' }
  ],
  [AGENT_TYPES.SUPPORT]: [
    { role: 'user', content: 'היי, ההזמנה שלי עדיין לא הגיעה' },
    { role: 'agent', content: 'שלום! אני מצטער לשמוע שההזמנה שלך מתעכבת. אשמח לעזור. האם תוכל לספק את מספר ההזמנה?' },
    { role: 'user', content: 'כן, המספר הוא #12345' },
    { role: 'agent', content: 'תודה! אני בודק את סטטוס ההזמנה #12345...' },
    { role: 'agent', content: 'מצאתי את ההזמנה שלך. אני רואה שהיא נשלחה לפני יומיים ואמורה להגיע מחר. לפי מערכת המעקב, החבילה נמצאת כרגע במרכז המיון האחרון לפני המשלוח לכתובת שלך.' },
    { role: 'user', content: 'האם אפשר לקבל מספר מעקב?' },
    { role: 'agent', content: 'בוודאי! הנה מספר המעקב של ההזמנה שלך: TRK123456789IL\n\nאתה יכול לעקוב אחר המשלוח באתר חברת השליחויות: https://shipping.example.com/track\n\nהאם יש משהו נוסף שאוכל לעזור בו?' },
    { role: 'user', content: 'לא, זה הכל. תודה רבה!' },
    { role: 'agent', content: 'שמחתי לעזור! אם תצטרך עזרה נוספת, אל תהסס לפנות אלינו. מאחל לך יום נפלא!' }
  ],
  [AGENT_TYPES.PRODUCT]: [
    { role: 'user', content: 'האם המוצר X תומך ב-Bluetooth?' },
    { role: 'agent', content: 'שלום! כן, המוצר X תומך בטכנולוגיית Bluetooth 5.0, המאפשרת חיבור למגוון מכשירים במרחק של עד 10 מטרים.' },
    { role: 'user', content: 'כמה זמן הסוללה מחזיקה?' },
    { role: 'agent', content: 'סוללת המוצר X מחזיקה עד 12 שעות של שימוש רציף!\n\nבמצב המתנה, הסוללה יכולה להחזיק עד 30 ימים. הטעינה המלאה אורכת כשעתיים באמצעות כבל USB-C המצורף לאריזה.' },
    { role: 'user', content: 'האם הוא עמיד למים?' },
    { role: 'agent', content: 'המוצר X הוא עמיד למים בתקן IPX7, כלומר הוא יכול לשרוד טבילה במים בעומק של עד מטר אחד למשך 30 דקות.\n\nזה אומר שהוא מוגן מפני גשם, התזות מים ואפילו טבילה קצרה, אך אינו מיועד לשימוש תת-ימי ממושך.' },
    { role: 'user', content: 'מה האחריות על המוצר?' },
    { role: 'agent', content: 'המוצר X מגיע עם אחריות יצרן מלאה למשך שנתיים!\n\nהאחריות מכסה כל פגם בייצור ותקלות טכניות שאינן נובעות משימוש לא נכון. בנוסף, אנו מציעים 30 ימי ניסיון עם החזר כספי מלא אם אינך מרוצה מהמוצר מכל סיבה שהיא.' }
  ],
  [AGENT_TYPES.GENERAL]: [
    { role: 'user', content: 'שלום, מה שעות הפעילות שלכם?' },
    { role: 'agent', content: 'שלום! שעות הפעילות שלנו הן:\n\nימים א\'-ה\': 9:00-20:00\nיום ו\': 9:00-14:00\nשבת: סגור\n\nהאם אוכל לעזור לך בנושא נוסף?' },
    { role: 'user', content: 'האם יש לכם סניף בתל אביב?' },
    { role: 'agent', content: 'כן! יש לנו סניף מרכזי בתל אביב הממוקם ברחוב דיזנגוף 99.\n\nהסניף כולל חנות תצוגה ומרכז שירות לקוחות. חניה זמינה בחניון הסמוך (שעה ראשונה חינם ללקוחות החנות).' },
    { role: 'user', content: 'האם אתם מציעים משלוח לכל הארץ?' },
    { role: 'agent', content: 'בהחלט! אנחנו מספקים משלוחים לכל רחבי הארץ.\n\nמשלוח רגיל (3-5 ימי עסקים): 29.90 ש"ח\nמשלוח מהיר (1-2 ימי עסקים): 49.90 ש"ח\n\nהזמנות מעל 200 ש"ח מקבלות משלוח רגיל חינם!' },
    { role: 'user', content: 'תודה על המידע!' },
    { role: 'agent', content: 'בשמחה! אנחנו כאן לכל שאלה נוספת. מאחל/ת לך יום נפלא!' }
  ]
};

// אנימציות לאלמנטים שונים
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.3,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  }
};

// קומפוננטה להצגת אפקט הקלדה
const TypingEffect = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(currentIndex + 1);
      }, 30 + Math.random() * 40); // מהירות הקלדה משתנה
      
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, onComplete]);
  
  return <span>{displayedText}</span>;
};

// קומפוננטה להצגת אפקט "חושב..."
const ThinkingEffect = () => {
  const [dots, setDots] = useState('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 400);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex items-center text-gray-500 text-sm">
      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
        <span className="text-blue-500">🤖</span>
      </div>
      <span>חושב{dots}</span>
    </div>
  );
};

export default function LiveDemo({ agentId, agentType = AGENT_TYPES.GENERAL, isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isDemoComplete, setIsDemoComplete] = useState(false);
  const [demoSpeed, setDemoSpeed] = useState(1); // מהירות הדמו (1 = רגיל)
  const messagesEndRef = useRef(null);
  
  // איפוס הדמו בפתיחה
  useEffect(() => {
    if (isOpen) {
      setMessages([]);
      setCurrentMessageIndex(0);
      setIsTyping(false);
      setIsThinking(false);
      setIsDemoComplete(false);
      
      // התחלת הדמו
      startDemo();
    }
  }, [isOpen, agentType]);
  
  // פונקציה להתחלת הדמו
  const startDemo = () => {
    // בחירת תסריט לפי סוג הסוכן
    const script = DEMO_SCRIPTS[agentType] || DEMO_SCRIPTS[AGENT_TYPES.GENERAL];
    
    // הצגת ההודעה הראשונה
    displayNextMessage(script);
  };
  
  // פונקציה להצגת ההודעה הבאה בתסריט
  const displayNextMessage = (script) => {
    if (currentMessageIndex >= script.length) {
      setIsDemoComplete(true);
      return;
    }
    
    const nextMessage = script[currentMessageIndex];
    
    if (nextMessage.role === 'user') {
      // הצגת הודעת משתמש עם אפקט הקלדה
      setIsTyping(true);
      
      setTimeout(() => {
        setMessages(prev => [...prev, nextMessage]);
        setIsTyping(false);
        
        // אם ההודעה הבאה היא של הסוכן, מציג אפקט "חושב..."
        if (currentMessageIndex + 1 < script.length && script[currentMessageIndex + 1].role === 'agent') {
          setIsThinking(true);
          
          // הצגת הודעת הסוכן אחרי השהייה
          setTimeout(() => {
            setIsThinking(false);
            setCurrentMessageIndex(prev => prev + 1);
            displayNextMessage(script);
          }, 1500 / demoSpeed);
        } else {
          setCurrentMessageIndex(prev => prev + 1);
          displayNextMessage(script);
        }
      }, 1000 / demoSpeed);
    } else {
      // הצגת הודעת סוכן
      setMessages(prev => [...prev, nextMessage]);
      
      // המשך לפי מהירות הדמו
      setTimeout(() => {
        setCurrentMessageIndex(prev => prev + 1);
        displayNextMessage(script);
      }, 2000 / demoSpeed);
    }
  };
  
  // גלילה אוטומטית לתחתית הצ'אט כשמתווספת הודעה חדשה
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isThinking]);
  
  // פונקציה לשינוי מהירות הדמו
  const changeSpeed = (newSpeed) => {
    setDemoSpeed(newSpeed);
  };
  
  // פונקציה להפעלת הדמו מחדש
  const restartDemo = () => {
    setMessages([]);
    setCurrentMessageIndex(0);
    setIsTyping(false);
    setIsThinking(false);
    setIsDemoComplete(false);
    startDemo();
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-2xl"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={e => e.stopPropagation()}
          >
            {/* כותרת */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">דמו חי - סימולציית שיחה</h3>
              <div className="flex items-center space-x-2">
                {/* בקרת מהירות */}
                <div className="flex items-center space-x-1 ml-4">
                  <span className="text-xs">מהירות:</span>
                  <button 
                    onClick={() => changeSpeed(0.5)} 
                    className={`px-2 py-1 text-xs rounded ${demoSpeed === 0.5 ? 'bg-white text-blue-600' : 'bg-blue-500 hover:bg-blue-400'}`}
                  >
                    0.5x
                  </button>
                  <button 
                    onClick={() => changeSpeed(1)} 
                    className={`px-2 py-1 text-xs rounded ${demoSpeed === 1 ? 'bg-white text-blue-600' : 'bg-blue-500 hover:bg-blue-400'}`}
                  >
                    1x
                  </button>
                  <button 
                    onClick={() => changeSpeed(2)} 
                    className={`px-2 py-1 text-xs rounded ${demoSpeed === 2 ? 'bg-white text-blue-600' : 'bg-blue-500 hover:bg-blue-400'}`}
                  >
                    2x
                  </button>
                </div>
                
                {/* כפתור סגירה */}
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* תוכן הצ'אט */}
            <div className="h-96 overflow-y-auto p-4 bg-gray-50">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    variants={messageVariants}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-3/4 rounded-lg p-3 ${
                        message.role === 'user' 
                          ? 'bg-blue-500 text-white rounded-br-none' 
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <div className="flex items-center">
                          <span className="whitespace-pre-wrap">{message.content}</span>
                          <span className="mr-2">👤</span>
                        </div>
                      ) : (
                        <div className="flex items-start">
                          <span className="ml-2 mt-1">🤖</span>
                          <span className="whitespace-pre-wrap">{message.content}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {/* אפקט הקלדה */}
                {isTyping && (
                  <motion.div
                    variants={messageVariants}
                    className="flex justify-end"
                  >
                    <div className="bg-gray-200 text-gray-500 rounded-lg p-3 max-w-3/4">
                      <div className="flex items-center">
                        <span>מקליד...</span>
                        <span className="mr-2">👤</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* אפקט "חושב..." */}
                {isThinking && (
                  <motion.div
                    variants={messageVariants}
                    className="flex justify-start"
                  >
                    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                      <ThinkingEffect />
                    </div>
                  </motion.div>
                )}
                
                {/* סיום הדמו */}
                {isDemoComplete && (
                  <motion.div
                    variants={messageVariants}
                    className="flex justify-center"
                  >
                    <button
                      onClick={restartDemo}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-full text-sm transition-colors duration-200 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                      הפעל דמו מחדש
                    </button>
                  </motion.div>
                )}
                
                {/* רפרנס לגלילה אוטומטית */}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* כפתורי פעולה */}
            <div className="bg-gray-100 px-6 py-3 flex justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => restartDemo()}
                  className="bg-white hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-md text-sm border border-gray-300 transition-colors duration-200 flex items-center mr-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  התחל מחדש
                </button>
              </div>
              
              <button
                onClick={onClose}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm transition-colors duration-200"
              >
                סגור
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 