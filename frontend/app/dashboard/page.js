'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import LogPanel from '../../components/LogPanel';
import { useAgents } from '../../context/AgentContext';
import { useAuth } from '../../context/AuthContext';
import { formatNumber, getStatusColor, getPlatformIcon, formatDate } from '../../utils';
import { withAuth } from '../../context/AuthContext';
import { FaSearch, FaFilter, FaPlus, FaCopy, FaEdit, FaTrash, FaEye, FaTerminal } from 'react-icons/fa';

function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    agents, 
    stats, 
    loading, 
    error, 
    fetchAgents,
    removeAgent,
    fetchAgentShareLink
  } = useAgents();
  
  // מצבים לניהול הממשק
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('הכל');
  const [platformFilter, setPlatformFilter] = useState('הכל');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState(null);
  const [copySuccess, setCopySuccess] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [openLogPanelId, setOpenLogPanelId] = useState(null); // מזהה הסוכן שהלוגים שלו פתוחים
  const [isLogPanelVisible, setIsLogPanelVisible] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  
  // רפרנס לטיימר של הודעת ההעתקה
  const copyTimerRef = useRef(null);

  useEffect(() => {
    // אנימציה לטעינת הדף
    setIsVisible(true);
    
    // טעינת נתונים מהשרת - רק פעם אחת בטעינת הדף
    fetchAgents();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // פונקציה למיון הסוכנים
  const sortedAgents = () => {
    if (!agents) return [];
    
    // סינון לפי חיפוש
    let filteredAgents = agents.filter(agent => {
      const matchesSearch = searchTerm === '' || 
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.storeUrl.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesStatus = statusFilter === 'הכל' || agent.status === statusFilter;
      const matchesPlatform = platformFilter === 'הכל' || agent.platform === platformFilter;
      
      return matchesSearch && matchesStatus && matchesPlatform;
    });
    
    // מיון לפי הגדרות המיון
    return [...filteredAgents].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // פונקציה לשינוי המיון
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // פונקציה להעתקת לינק
  const copyLink = async (agentId) => {
    try {
      // ניסיון לקבל את הלינק האמיתי מהשרת
      const shareData = await fetchAgentShareLink(agentId);
      const link = shareData?.shareLink || `https://t.me/your_bot?start=${agentId}`;
      
      await navigator.clipboard.writeText(link);
      
      // הצגת הודעת הצלחה
      setCopySuccess(agentId);
      
      // ניקוי טיימר קודם אם קיים
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
      
      // הגדרת טיימר חדש להסרת ההודעה
      copyTimerRef.current = setTimeout(() => {
        setCopySuccess(null);
      }, 2000);
    } catch (err) {
      console.error('שגיאה בהעתקת הלינק:', err);
    }
  };

  // פונקציה לפתיחת חלון אישור מחיקה
  const openDeleteModal = (agent) => {
    setAgentToDelete(agent);
    setShowDeleteModal(true);
  };

  // פונקציה למחיקת סוכן
  const handleDeleteAgent = async () => {
    if (!agentToDelete) return;
    
    try {
      await removeAgent(agentToDelete.id);
      setShowDeleteModal(false);
      setAgentToDelete(null);
    } catch (error) {
      console.error('שגיאה במחיקת הסוכן:', error);
    }
  };

  // פונקציה לקבלת אייקון פלטפורמה
  const renderPlatformIcon = (platform) => {
    if (platform === 'טלגרם') {
      return (
        <div className="flex items-center">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.269c-.145.658-.537.818-1.084.51l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.538-.196 1.006.128.833.95z" />
            </svg>
          </div>
          <span className="text-blue-600">טלגרם</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center">
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.13.332.202.043.72.043.433-.101.824z" />
            </svg>
          </div>
          <span className="text-green-600">וואטסאפ</span>
        </div>
      );
    }
  };

  // פונקציה לקבלת צבע סטטוס
  const renderStatus = (status) => {
    if (status === 'פעיל') {
      return (
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span className="text-green-600">פעיל</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
          <span className="text-red-600">לא פעיל</span>
        </div>
      );
    }
  };

  // פונקציה לקבלת אייקון מיון
  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' 
        ? <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        : <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>;
    }
    return null;
  };

  // פונקציה לפתיחת/סגירת חלונית הלוגים
  const toggleLogPanel = (agentId) => {
    if (openLogPanelId === agentId) {
      setOpenLogPanelId(null); // סגירת הפאנל אם הוא כבר פתוח
    } else {
      setOpenLogPanelId(agentId); // פתיחת הפאנל
    }
  };
  
  // פונקציה לסגירת חלונית הלוגים
  const closeLogPanel = () => {
    setOpenLogPanelId(null);
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <main>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="text-lg text-gray-700">טוען נתונים...</div>
              </div>
            </div>
          ) : (
            <>
              {/* כותרת ראשית */}
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">לוח בקרה</h1>
                <Link
                  href="/create-agent"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  יצירת סוכן חדש
                </Link>
              </div>
              
              {/* אזור סטטיסטיקות כלליות */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* סטטיסטיקה 1 - סוכנים פעילים */}
                <div className="bg-white rounded-xl shadow-md p-6 border-r-4 border-blue-500 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                    </div>
                    <div className="text-green-500 font-medium text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      +2.5%
                    </div>
                  </div>
                  <h3 className="text-gray-500 text-sm mb-1">סוכנים פעילים</h3>
                  <div className="flex items-center">
                    <p className="text-3xl font-bold text-gray-800">{stats.activeAgents || 0}</p>
                    <span className="text-sm text-gray-500 mr-2">מתוך {stats.totalAgents || 0}</span>
                  </div>
                </div>
                
                {/* סטטיסטיקה 2 - סוכנים לא פעילים */}
                <div className="bg-white rounded-xl shadow-md p-6 border-r-4 border-red-500 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-red-500 font-medium text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                      </svg>
                      -1.2%
                    </div>
                  </div>
                  <h3 className="text-gray-500 text-sm mb-1">סוכנים לא פעילים</h3>
                  <div className="flex items-center">
                    <p className="text-3xl font-bold text-gray-800">{(stats.totalAgents || 0) - (stats.activeAgents || 0)}</p>
                    <span className="text-sm text-gray-500 mr-2">מתוך {stats.totalAgents || 0}</span>
                  </div>
                </div>
                
                {/* סטטיסטיקה 3 - חנויות מחוברות */}
                <div className="bg-white rounded-xl shadow-md p-6 border-r-4 border-purple-500 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                      </svg>
                    </div>
                    <div className="text-green-500 font-medium text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      +3.8%
                    </div>
                  </div>
                  <h3 className="text-gray-500 text-sm mb-1">חנויות מחוברות</h3>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalAgents || 0}</p>
                </div>
                
                {/* סטטיסטיקה 4 - אינטראקציות השבוע */}
                <div className="bg-white rounded-xl shadow-md p-6 border-r-4 border-green-500 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                        <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                      </svg>
                    </div>
                    <div className="text-green-500 font-medium text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      +5.2%
                    </div>
                  </div>
                  <h3 className="text-gray-500 text-sm mb-1">אינטראקציות השבוע</h3>
                  <p className="text-3xl font-bold text-gray-800">{(stats.totalConversations || 0).toLocaleString()}</p>
                </div>
              </div>
              
              {/* אזור חיפוש וסינון */}
              <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* חיפוש */}
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 p-2.5"
                      placeholder="חיפוש לפי שם או כתובת חנות..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  {/* סינון לפי סטטוס */}
                  <div className="w-full md:w-48">
                    <select
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="הכל">כל הסטטוסים</option>
                      <option value="פעיל">פעיל</option>
                      <option value="לא פעיל">לא פעיל</option>
                    </select>
                  </div>
                  
                  {/* סינון לפי פלטפורמה */}
                  <div className="w-full md:w-48">
                    <select
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      value={platformFilter}
                      onChange={(e) => setPlatformFilter(e.target.value)}
                    >
                      <option value="הכל">כל הפלטפורמות</option>
                      <option value="טלגרם">טלגרם</option>
                      <option value="וואטסאפ">וואטסאפ</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* טבלת ניהול סוכנים */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th 
                          scope="col" 
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => requestSort('name')}
                        >
                          <div className="flex items-center justify-end">
                            {getSortIcon('name')}
                            <span>שם הסוכן</span>
                          </div>
                        </th>
                        <th 
                          scope="col" 
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => requestSort('storeUrl')}
                        >
                          <div className="flex items-center justify-end">
                            {getSortIcon('storeUrl')}
                            <span>כתובת החנות</span>
                          </div>
                        </th>
                        <th 
                          scope="col" 
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => requestSort('platform')}
                        >
                          <div className="flex items-center justify-end">
                            {getSortIcon('platform')}
                            <span>פלטפורמה</span>
                          </div>
                        </th>
                        <th 
                          scope="col" 
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => requestSort('status')}
                        >
                          <div className="flex items-center justify-end">
                            {getSortIcon('status')}
                            <span>סטטוס</span>
                          </div>
                        </th>
                        <th 
                          scope="col" 
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => requestSort('createdAt')}
                        >
                          <div className="flex items-center justify-end">
                            {getSortIcon('createdAt')}
                            <span>תאריך יצירה</span>
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          פעולות
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedAgents().length > 0 ? (
                        sortedAgents().map((agent) => (
                          <>
                            <tr key={agent.id} className="hover:bg-gray-50 transition-colors duration-200">
                              {/* שם הסוכן */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                              </td>
                              
                              {/* כתובת החנות */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  <a href={agent.storeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    {agent.storeUrl}
                                  </a>
                                </div>
                              </td>
                              
                              {/* פלטפורמה */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                {renderPlatformIcon(agent.platform)}
                              </td>
                              
                              {/* סטטוס */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                {renderStatus(agent.status)}
                              </td>
                              
                              {/* תאריך יצירה */}
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(agent.createdAt)}
                              </td>
                              
                              {/* פעולות */}
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center space-x-3 justify-end">
                                  {/* כפתור לוגים */}
                                  <button
                                    onClick={() => {
                                      setSelectedAgentId(agent.id);
                                      setIsLogPanelVisible(true);
                                    }}
                                    className={`text-gray-600 hover:text-blue-700 relative mr-3 ${selectedAgentId === agent.id ? 'text-blue-700' : ''}`}
                                    title="הצג לוגים"
                                  >
                                    <FaTerminal size={14} className="ml-1" />
                                    <span className="text-xs">Log</span>
                                  </button>
                                  
                                  {/* העתקת לינק */}
                                  <button
                                    onClick={() => copyLink(agent.id)}
                                    className="text-blue-600 hover:text-blue-900 relative mr-3"
                                    title="העתק לינק"
                                  >
                                    <FaCopy size={14} />
                                  </button>
                                  
                                  {/* עריכה */}
                                  <Link
                                    href={`/edit-agent/${agent.id}`}
                                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                                    title="ערוך"
                                  >
                                    <FaEdit size={14} />
                                  </Link>
                                  
                                  {/* מחיקה */}
                                  <button
                                    onClick={() => openDeleteModal(agent)}
                                    className="text-red-600 hover:text-red-900"
                                    title="מחק"
                                  >
                                    <FaTrash size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {/* חלונית לוגים */}
                            {selectedAgentId === agent.id && (
                              <tr>
                                <td colSpan="6" className="p-0 border-0">
                                  <LogPanel 
                                    agentId={agent.id} 
                                    isOpen={selectedAgentId === agent.id} 
                                    onClose={() => {
                                      setIsLogPanelVisible(false);
                                      setSelectedAgentId(null);
                                    }} 
                                  />
                                </td>
                              </tr>
                            )}
                          </>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                            לא נמצאו סוכנים. לחץ על "יצירת סוכן חדש" כדי להתחיל.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      
      {/* חלון מודאלי לאישור מחיקה */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-2">האם אתה בטוח?</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  האם אתה בטוח שברצונך למחוק את הסוכן "{agentToDelete?.name}"? פעולה זו לא ניתנת לביטול.
                </p>
              </div>
              <div className="flex justify-center gap-4 mt-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  ביטול
                </button>
                <button
                  onClick={handleDeleteAgent}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  מחק
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(Dashboard);
