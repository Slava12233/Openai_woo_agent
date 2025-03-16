'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import { useAgents } from '../../../context/AgentContext';
import { withAuth } from '../../../context/AuthContext';
import { formatDate, formatNumber } from '../../../utils';
import { toast } from 'react-hot-toast';

function AgentDetails({ params }) {
  const router = useRouter();
  const { id } = params;
  const { getAgent, deleteAgent, loading: agentLoading } = useAgents();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalConversations: 0,
    activeUsers: 0,
    ordersCreated: 0,
    totalRevenue: 0
  });
  const [recentConversations, setRecentConversations] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // טעינת נתוני הסוכן
  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        const agentData = await getAgent(id);
        if (agentData) {
          setAgent(agentData);
          
          // לצורך הדגמה, נשתמש בנתונים לדוגמה
          setStats({
            totalConversations: 1249,
            activeUsers: 87,
            ordersCreated: 42,
            totalRevenue: 15780
          });
          
          setRecentConversations([
            { id: 1, user: 'יוסי כהן', date: new Date(2025, 2, 15, 14, 30), message: 'אני מחפש חולצה בצבע כחול במידה L' },
            { id: 2, user: 'רונית לוי', date: new Date(2025, 2, 15, 13, 15), message: 'מתי המשלוח שלי אמור להגיע?' },
            { id: 3, user: 'דני אבני', date: new Date(2025, 2, 15, 11, 45), message: 'האם יש לכם את הנעליים האלה במידה 43?' }
          ]);
          
          setRecentOrders([
            { id: 1001, user: 'יוסי כהן', date: new Date(2025, 2, 15), total: 249, status: 'הושלמה' },
            { id: 1002, user: 'רונית לוי', date: new Date(2025, 2, 14), total: 189, status: 'בטיפול' },
            { id: 1003, user: 'דני אבני', date: new Date(2025, 2, 13), total: 520, status: 'נשלחה' }
          ]);
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
  }, [id, getAgent, router]);
  
  const handleDeleteAgent = async () => {
    setDeleting(true);
    
    try {
      await deleteAgent(id);
      toast.success('הסוכן נמחק בהצלחה');
      router.push('/dashboard');
    } catch (err) {
      console.error('שגיאה במחיקת הסוכן:', err);
      toast.error('אירעה שגיאה במחיקת הסוכן');
      setDeleteModalOpen(false);
    } finally {
      setDeleting(false);
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
            <h1 className="text-2xl font-bold text-foreground">פרטי סוכן</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-foreground">פרטי סוכן</h1>
            <div className="flex space-x-3">
              <Link
                href={`/edit-agent/${id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ml-3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                ערוך סוכן
              </Link>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                מחק סוכן
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* כרטיס פרטי סוכן */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">פרטי סוכן</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">מידע מפורט על הסוכן והחנות המקושרת</p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">שם הסוכן</h4>
                  <p className="text-lg font-medium text-gray-900">{agent.name}</p>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">כתובת החנות</h4>
                  <a href={agent.storeUrl} target="_blank" rel="noopener noreferrer" className="text-lg font-medium text-primary hover:text-blue-700">
                    {agent.storeUrl}
                  </a>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">פלטפורמה</h4>
                  <div className="flex items-center">
                    {agent.platform === 'telegram' ? (
                      <>
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center ml-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.269c-.145.658-.537.818-1.084.51l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.538-.196 1.006.128.833.95z" />
                          </svg>
                        </div>
                        <span className="text-lg font-medium text-gray-900">טלגרם</span>
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center ml-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.13.332.202.043.72.043.433-.101.824z" />
                          </svg>
                        </div>
                        <span className="text-lg font-medium text-gray-900">ווצאפ</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">שיתוף הסוכן</h4>
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
                
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">סטטוס</h4>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                    agent.status === 'פעיל' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {agent.status === 'פעיל' ? (
                      <svg className="h-2 w-2 text-green-500 ml-1" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                    ) : (
                      <svg className="h-2 w-2 text-red-500 ml-1" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                    )}
                    {agent.status}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* סטטיסטיקות */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* סטטיסטיקה 1 - סך השיחות */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-gray-500 text-sm mb-1">סך השיחות</h3>
            <p className="text-3xl font-bold text-gray-800">{formatNumber(stats.totalConversations)}</p>
          </div>
          
          {/* סטטיסטיקה 2 - משתמשים פעילים */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-gray-500 text-sm mb-1">משתמשים פעילים</h3>
            <p className="text-3xl font-bold text-gray-800">{formatNumber(stats.activeUsers)}</p>
          </div>
          
          {/* סטטיסטיקה 3 - הזמנות שנוצרו */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-gray-500 text-sm mb-1">הזמנות שנוצרו</h3>
            <p className="text-3xl font-bold text-gray-800">{formatNumber(stats.ordersCreated)}</p>
          </div>
          
          {/* סטטיסטיקה 4 - סך ההכנסות */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-gray-500 text-sm mb-1">סך ההכנסות</h3>
            <p className="text-3xl font-bold text-gray-800">₪{formatNumber(stats.totalRevenue)}</p>
          </div>
        </div>
        
        {/* שיחות אחרונות והזמנות אחרונות */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* שיחות אחרונות */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">שיחות אחרונות</h3>
            </div>
            
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-4">
                {recentConversations.map((conversation) => (
                  <div key={conversation.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-gray-900">{conversation.user}</div>
                      <div className="text-sm text-gray-500">{formatDate(conversation.date)}</div>
                    </div>
                    <p className="text-gray-600 text-sm">{conversation.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* הזמנות אחרונות */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">הזמנות אחרונות</h3>
            </div>
            
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-gray-900">הזמנה #{order.id}</div>
                      <div className="text-sm text-gray-500">{formatDate(order.date)}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">{order.user}</div>
                      <div className="flex items-center">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${
                          order.status === 'הושלמה' ? 'bg-green-100 text-green-800' :
                          order.status === 'בטיפול' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {order.status}
                        </div>
                        <div className="font-medium text-gray-900">₪{order.total}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* מודל מחיקה */}
        {deleteModalOpen && (
          <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
            <div className="relative bg-white rounded-lg max-w-md w-full mx-auto p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">מחיקת סוכן</h3>
                <p className="text-sm text-gray-500 mb-6">
                  האם אתה בטוח שברצונך למחוק את הסוכן? פעולה זו אינה ניתנת לביטול.
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setDeleteModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ml-3"
                  >
                    ביטול
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteAgent}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting ? 'מוחק...' : 'מחק סוכן'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default withAuth(AgentDetails);
