'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalConversations: 0,
  });
  
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agentPerformance, setAgentPerformance] = useState({
    current: 0,
    target: 0,
    percentage: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // אנימציה לטעינת הדף
    setIsVisible(true);
    
    // כאן יהיה קוד לטעינת נתונים מה-API
    // לצורך הדגמה, נשתמש בנתונים לדוגמה
    setTimeout(() => {
      setStats({
        totalAgents: 5,
        activeAgents: 3,
        totalConversations: 3100,
      });
      
      setAgentPerformance({
        current: 1300,
        target: 1800,
        percentage: 75
      });
      
      setAgents([
        { 
          id: 1, 
          name: 'סוכן חנות הבגדים', 
          storeUrl: 'https://clothing-store.co.il', 
          platform: 'טלגרם',
          status: 'פעיל',
          conversations: 1249,
          growth: 15.2
        },
        { 
          id: 2, 
          name: 'סוכן חנות הספרים', 
          storeUrl: 'https://book-store.co.il', 
          platform: 'טלגרם',
          status: 'פעיל',
          conversations: 1145,
          growth: 13.9
        },
        { 
          id: 3, 
          name: 'סוכן חנות האלקטרוניקה', 
          storeUrl: 'https://electronics-store.co.il', 
          platform: 'ווצאפ',
          status: 'פעיל',
          conversations: 1073,
          growth: 9.5
        },
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  // פונקציה להעתקת לינק
  const copyLink = (agentId) => {
    // בפועל, כאן יהיה קוד להעתקת הלינק האמיתי של הסוכן
    const link = `https://t.me/your_bot?start=${agentId}`;
    navigator.clipboard.writeText(link)
      .then(() => {
        alert('הלינק הועתק בהצלחה!');
      })
      .catch(err => {
        console.error('שגיאה בהעתקת הלינק:', err);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* תוכן ראשי עם מרווח לתפריט צד */}
      <div className="md:mr-64 pt-16 md:pt-0">
        <main className={`max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="text-lg text-gray-700">טוען נתונים...</div>
              </div>
            </div>
          ) : (
            <>
              {/* שורה ראשונה - סקירה כללית */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">סקירה כללית</h2>
                  <div className="bg-white border border-gray-200 rounded-md shadow-sm">
                    <select className="py-2 px-4 bg-transparent text-gray-700 font-medium focus:outline-none">
                      <option>חודשי</option>
                      <option>שבועי</option>
                      <option>יומי</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* סטטיסטיקה 1 - סך הסוכנים */}
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                      </div>
                      <div className="text-green-500 font-medium text-sm">
                        +3.4%
                        <span className="text-gray-500 mr-1">מהחודש שעבר</span>
                      </div>
                    </div>
                    <h3 className="text-gray-500 text-sm mb-1">סך הסוכנים</h3>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalAgents}</p>
                  </div>
                  
                  {/* סטטיסטיקה 2 - סוכנים פעילים */}
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-green-500 font-medium text-sm">
                        +1.8%
                        <span className="text-gray-500 mr-1">מהחודש שעבר</span>
                      </div>
                    </div>
                    <h3 className="text-gray-500 text-sm mb-1">סוכנים פעילים</h3>
                    <p className="text-3xl font-bold text-gray-800">{stats.activeAgents}</p>
                  </div>
                  
                  {/* סטטיסטיקה 3 - שיחות */}
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                          <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                        </svg>
                      </div>
                      <div className="text-green-500 font-medium text-sm">
                        +4.6%
                        <span className="text-gray-500 mr-1">מהחודש שעבר</span>
                      </div>
                    </div>
                    <h3 className="text-gray-500 text-sm mb-1">שיחות</h3>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalConversations.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              {/* שורה שנייה - גרף ויעד ביצועים */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* גרף שיחות */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">שיחות לאורך זמן</h2>
                    <div className="bg-gray-100 rounded-md">
                      <select className="py-1 px-3 bg-transparent text-gray-700 text-sm focus:outline-none">
                        <option>6 חודשים אחרונים</option>
                        <option>3 חודשים אחרונים</option>
                        <option>חודש אחרון</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* גרף לדוגמה */}
                  <div className="h-64 relative">
                    {/* ציר Y */}
                    <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
                      <span>600</span>
                      <span>500</span>
                      <span>400</span>
                      <span>300</span>
                      <span>200</span>
                      <span>100</span>
                      <span>0</span>
                    </div>
                    
                    {/* גרף */}
                    <div className="absolute left-8 right-0 top-0 h-full">
                      <svg className="w-full h-full" viewBox="0 0 300 150" preserveAspectRatio="none">
                        {/* קווי רקע */}
                        <line x1="0" y1="0" x2="300" y2="0" stroke="#f3f4f6" strokeWidth="1" />
                        <line x1="0" y1="25" x2="300" y2="25" stroke="#f3f4f6" strokeWidth="1" />
                        <line x1="0" y1="50" x2="300" y2="50" stroke="#f3f4f6" strokeWidth="1" />
                        <line x1="0" y1="75" x2="300" y2="75" stroke="#f3f4f6" strokeWidth="1" />
                        <line x1="0" y1="100" x2="300" y2="100" stroke="#f3f4f6" strokeWidth="1" />
                        <line x1="0" y1="125" x2="300" y2="125" stroke="#f3f4f6" strokeWidth="1" />
                        <line x1="0" y1="150" x2="300" y2="150" stroke="#f3f4f6" strokeWidth="1" />
                        
                        {/* קו הגרף */}
                        <path 
                          d="M0,120 C20,110 40,130 60,90 C80,50 100,70 120,40 C140,20 160,60 180,30 C200,10 220,50 240,20 C260,10 280,5 300,0" 
                          fill="none" 
                          stroke="#3B82F6" 
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    
                    {/* ציר X */}
                    <div className="absolute left-8 right-0 bottom-0 flex justify-between text-xs text-gray-500">
                      <span>ינואר</span>
                      <span>פברואר</span>
                      <span>מרץ</span>
                      <span>אפריל</span>
                      <span>מאי</span>
                      <span>יוני</span>
                    </div>
                  </div>
                </div>
                
                {/* יעד ביצועים */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">יעד שיחות</h2>
                    <div className="bg-gray-100 rounded-md">
                      <select className="py-1 px-3 bg-transparent text-gray-700 text-sm focus:outline-none">
                        <option>חודשי</option>
                        <option>שבועי</option>
                        <option>יומי</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center h-64">
                    <div className="relative w-48 h-48 mb-4">
                      {/* רקע העיגול */}
                      <div className="absolute inset-0 rounded-full bg-gray-100"></div>
                      
                      {/* העיגול הצבעוני */}
                      <div className="absolute inset-0 rounded-full" style={{ 
                        background: `conic-gradient(#3B82F6 0% ${agentPerformance.percentage}%, transparent ${agentPerformance.percentage}% 100%)`,
                        clipPath: 'circle(50% at center)'
                      }}></div>
                      
                      {/* העיגול הפנימי */}
                      <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center">
                        <div className="text-center">
                          <span className="text-4xl font-bold text-gray-800">{agentPerformance.percentage}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-gray-500 text-sm mb-1">
                        {agentPerformance.current.toLocaleString()} / {agentPerformance.target.toLocaleString()} שיחות
                      </p>
                      <p className="text-gray-600">
                        הושלמו החודש
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* שורה שלישית - סוכנים מובילים */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">סוכנים מובילים</h2>
                  <Link href="/agents" className="text-primary hover:text-blue-700 font-medium text-sm transition-colors">
                    הצג הכל
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {agents.map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden mr-4 flex items-center justify-center">
                          {agent.platform === 'טלגרם' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.269c-.145.658-.537.818-1.084.51l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.538-.196 1.006.128.833.95z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.13.332.202.043.72.043.433-.101.824z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">{agent.name}</h3>
                          <p className="text-sm text-gray-500">{agent.storeUrl}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-4">
                          <p className="text-sm text-gray-500">שיחות: {agent.conversations}</p>
                          <div className={`text-sm font-medium ${
                            agent.status === 'פעיל' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {agent.status}
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          agent.growth > 10 ? 'bg-green-100 text-green-800' : 
                          agent.growth > 5 ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          +{agent.growth}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-center">
                  <Link
                    href="/create-agent"
                    className="bg-primary hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-all duration-300 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    יצירת סוכן חדש
                  </Link>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
} 