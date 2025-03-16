'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import LogPanel from '../../components/LogPanel';
import { useAgents } from '../../context/AgentContext';
import { useAuth } from '../../context/AuthContext';
import { formatNumber, getStatusColor, getPlatformIcon, formatDate } from '../../utils';
import { withAuth } from '../../context/AuthContext';
import { FaSearch, FaFilter, FaPlus, FaCopy, FaEdit, FaTrash, FaCogs, FaTerminal, FaChartLine, FaClock, FaShoppingCart, FaRobot } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { SearchInput } from '@/components/ui/Input';

// קומפוננטת CardStat מקומית
function CardStat({ 
  title, 
  value, 
  icon, 
  trend = null, 
  trendValue = null, 
  className = '',
  textClassName = '',
  ...props 
}) {
  return (
    <div 
      className={`bg-white border border-gray-300 rounded-md shadow-none p-6 ${className}`}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className={`text-gray-800 ${textClassName}`}>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
          
          {trend && (
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                </svg>
              )}
              <span className={`text-xs font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="bg-gray-100 p-3 rounded-md">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// אנימציות לכניסת אלמנטים
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

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
    fetchAgentShareLink,
    editAgent,
    updateStats
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
  const [updatingStatus, setUpdatingStatus] = useState(null); // מזהה הסוכן שמעדכנים את הסטטוס שלו
  
  // מצבים לניהול האנליטיקה
  const [selectedAnalyticsAgentId, setSelectedAnalyticsAgentId] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7');
  
  // רפרנס לטיימר של הודעת ההעתקה
  const copyTimerRef = useRef(null);

  useEffect(() => {
    // אנימציה לטעינת הדף
    setIsVisible(true);
    
    // טעינת נתונים מהשרת - רק פעם אחת בטעינת הדף
    // fetchAgents נקרא אוטומטית בתוך AgentContext בעת טעינת הדף
    // אין צורך לקרוא לו שוב כאן
    // fetchAgents();
  }, []); // הסרת fetchAgents ממערך התלויות

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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.269c-.145.658-.537.818-1.084.51l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.538-.196 1.006.128.833.95z" />
            </svg>
          </div>
          <span className="text-blue-600 font-medium">טלגרם</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center">
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.13.332.202.043.72.043.433-.101.824z" />
            </svg>
          </div>
          <span className="text-green-600 font-medium">וואטסאפ</span>
        </div>
      );
    }
  };

  // פונקציה לשינוי סטטוס הסוכן
  const toggleAgentStatus = async (agent) => {
    try {
      setUpdatingStatus(agent.id);
      const newStatus = agent.status === 'פעיל' ? 'לא פעיל' : 'פעיל';
      
      // עדכון הסוכן עם הסטטוס החדש
      await editAgent(agent.id, { status: newStatus });
      
      // הודעת הצלחה
      console.log(`סטטוס הסוכן "${agent.name}" שונה ל-${newStatus}`);
    } catch (error) {
      console.error('שגיאה בשינוי סטטוס הסוכן:', error);
    } finally {
      setUpdatingStatus(null);
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
        ? <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        : <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
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

  // עדכון הסטטיסטיקות בהתאם לנתונים בטבלה
  useEffect(() => {
    if (agents && agents.length > 0) {
      // חישוב מספר הסוכנים הפעילים ולא פעילים
      const activeAgents = agents.filter(agent => agent.status === 'פעיל').length;
      const inactiveAgents = agents.filter(agent => agent.status === 'לא פעיל').length;
      
      // עדכון הסטטיסטיקות
      const updatedStats = {
        ...stats,
        activeAgents: activeAgents,
        inactiveAgents: inactiveAgents,
        totalStores: agents.length, // מספר החנויות המחוברות הוא מספר הסוכנים
      };
      
      // אם יש פונקציה לעדכון הסטטיסטיקות בקונטקסט, נשתמש בה
      if (typeof updateStats === 'function') {
        updateStats(updatedStats);
      }
    }
  }, [agents]);

  // פונקציה לקבלת נתוני אנליטיקה מסוננים לפי הסוכן הנבחר
  const getFilteredAnalytics = () => {
    if (selectedAnalyticsAgentId === 'all') {
      // החזרת נתונים כלליים עבור כל הסוכנים
      return {
        responseTime: stats?.averageResponseTime || 2.4,
        completionTime: stats?.averageCompletionTime || 5.7,
        accuracy: stats?.responseAccuracy || 94.2,
        conversionRate: stats?.conversionRate || 3.8,
        // נתונים נוספים...
      };
    } else {
      // מציאת הסוכן הנבחר
      const selectedAgent = agents.find(agent => agent.id === selectedAnalyticsAgentId);
      
      if (!selectedAgent) {
        return {
          responseTime: 0,
          completionTime: 0,
          accuracy: 0,
          conversionRate: 0,
        };
      }
      
      // החזרת נתונים ספציפיים לסוכן הנבחר
      // במקרה אמיתי, היינו מביאים את הנתונים מהשרת
      // כאן אנחנו מדמים נתונים שונים לכל סוכן
      const agentData = {
        '1': { responseTime: 2.4, completionTime: 5.7, accuracy: 94.2, conversionRate: 3.8 },
        '2': { responseTime: 1.8, completionTime: 4.2, accuracy: 96.5, conversionRate: 4.2 },
        '3': { responseTime: 3.2, completionTime: 6.8, accuracy: 92.1, conversionRate: 3.5 },
        '4': { responseTime: 2.1, completionTime: 5.1, accuracy: 95.8, conversionRate: 4.0 },
        '5': { responseTime: 2.8, completionTime: 6.2, accuracy: 93.4, conversionRate: 3.2 },
      };
      
      // בדיקה אם יש נתונים לסוכן הנבחר
      if (agentData[selectedAgent.id]) {
        return agentData[selectedAgent.id];
      }
      
      // אם אין נתונים ספציפיים, נייצר נתונים אקראיים לסוכן
      const randomResponseTime = (2 + Math.random() * 2).toFixed(1);
      const randomCompletionTime = (4 + Math.random() * 3).toFixed(1);
      const randomAccuracy = (90 + Math.random() * 8).toFixed(1);
      const randomConversionRate = (3 + Math.random() * 2).toFixed(1);
      
      return {
        responseTime: parseFloat(randomResponseTime),
        completionTime: parseFloat(randomCompletionTime),
        accuracy: parseFloat(randomAccuracy),
        conversionRate: parseFloat(randomConversionRate),
      };
    }
  };

  // קבלת הנתונים המסוננים
  const filteredAnalytics = getFilteredAnalytics();

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Navbar />
      
      <motion.div 
        className="flex-1 container mx-auto px-4 py-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div 
          className="flex justify-between items-center mb-8"
          variants={itemVariants}
        >
          <h1 className="text-3xl font-bold text-black">לוח בקרה</h1>
          <Button 
            variant="primary" 
            size="lg"
            icon={<FaPlus />}
            onClick={() => router.push('/create-agent')}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            יצירת סוכן חדש
          </Button>
        </motion.div>

        {/* כרטיסי סטטיסטיקה */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={itemVariants}
        >
          <CardStat
            title="אינטראקציות משתמשים"
            value={formatNumber(stats?.totalInteractions || 0)}
            trend="up"
            trendValue="5.7% מהשבוע שעבר"
            className="bg-white border border-gray-300 shadow-none"
            textClassName="text-black"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>}
          />
          
          <CardStat
            title="חנויות מחוברות"
            value={formatNumber(stats?.totalStores || 0)}
            trend="up"
            trendValue="3.8% מהחודש שעבר"
            className="bg-white border border-gray-300 shadow-none"
            textClassName="text-black"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>}
          />
          
          <CardStat
            title="סוכנים לא פעילים"
            value={formatNumber(stats?.inactiveAgents || 0)}
            trend="down"
            trendValue="1.2% מהשבוע שעבר"
            className="bg-white border border-gray-300 shadow-none"
            textClassName="text-black"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>}
          />
          
          <CardStat
            title="סוכנים פעילים"
            value={formatNumber(stats?.activeAgents || 0)}
            className="bg-white border border-gray-300 shadow-none"
            textClassName="text-black"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>}
          />
        </motion.div>

        {/* חיפוש וסינון */}
        <motion.div 
          className="bg-white border border-gray-300 rounded-md p-4 mb-8 flex flex-col md:flex-row gap-4 items-center shadow-none"
          variants={itemVariants}
        >
          <div className="w-full md:w-1/2">
            <SearchInput
              placeholder="חיפוש לפי שם או כתובת חנות..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-gray-300 text-black bg-white"
            />
          </div>
          
          <div className="flex gap-4 w-full md:w-1/2">
            <div className="w-1/2">
              <select
                className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-black focus:outline-none focus:ring-1 focus:ring-gray-300"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                dir="rtl"
              >
                <option value="הכל">כל הסטטוסים</option>
                <option value="פעיל">פעיל</option>
                <option value="לא פעיל">לא פעיל</option>
              </select>
            </div>
            
            <div className="w-1/2">
              <select
                className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-black focus:outline-none focus:ring-1 focus:ring-gray-300"
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                dir="rtl"
              >
                <option value="הכל">כל הפלטפורמות</option>
                <option value="טלגרם">טלגרם</option>
                <option value="וואטסאפ">וואטסאפ</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* טבלת סוכנים */}
        <div className="bg-white rounded-md border border-gray-300 shadow-none overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider cursor-pointer w-1/6"
                    onClick={() => requestSort('name')}
                  >
                    <div className="flex items-center justify-end">
                      {getSortIcon('name')}
                      <span>שם הסוכן</span>
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider cursor-pointer w-1/6"
                    onClick={() => requestSort('storeUrl')}
                  >
                    <div className="flex items-center justify-end">
                      {getSortIcon('storeUrl')}
                      <span>כתובת החנות</span>
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider cursor-pointer w-1/6"
                    onClick={() => requestSort('platform')}
                  >
                    <div className="flex items-center justify-end">
                      {getSortIcon('platform')}
                      <span>פלטפורמה</span>
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider cursor-pointer w-1/6"
                    onClick={() => requestSort('status')}
                  >
                    <div className="flex items-center justify-end">
                      {getSortIcon('status')}
                      <span>סטטוס</span>
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider cursor-pointer w-1/6"
                    onClick={() => requestSort('createdAt')}
                  >
                    <div className="flex items-center justify-end">
                      {getSortIcon('createdAt')}
                      <span>תאריך יצירה</span>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider w-1/6">
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
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Link href={`/agent/${agent.id}`} className="text-sm font-medium text-gray-900 hover:text-gray-700 hover:underline">
                            {agent.name}
                          </Link>
                        </td>
                        
                        {/* כתובת החנות */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm text-gray-500">
                            <a href={agent.storeUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline">
                              {agent.storeUrl}
                            </a>
                          </div>
                        </td>
                        
                        {/* פלטפורמה */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end">
                            <span className={`text-sm font-medium ${agent.platform === 'טלגרם' ? 'text-blue-600' : 'text-green-600'}`}>{agent.platform}</span>
                            <div className={`w-6 h-6 ${agent.platform === 'טלגרם' ? 'bg-blue-100' : 'bg-green-100'} rounded-md flex items-center justify-center ml-3`}>
                              {agent.platform === 'טלגרם' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.269c-.145.658-.537.818-1.084.51l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.538-.196 1.006.128.833.95z" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.13.332.202.043.72.043.433-.101.824z" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        {/* סטטוס */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end">
                            <span 
                              className={`text-sm font-medium ${
                                agent.status === 'פעיל' ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {agent.status}
                            </span>
                            <div 
                              className={`w-3 h-3 rounded-sm ml-3 ${
                                agent.status === 'פעיל' ? 'bg-green-500' : 'bg-red-500'
                              }`}
                            ></div>
                          </div>
                        </td>
                        
                        {/* תאריך יצירה */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {formatDate(agent.createdAt)}
                        </td>
                        
                        {/* פעולות */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center justify-end gap-3">
                          <button
                            onClick={() => copyLink(agent.id)}
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                            title="העתק קישור"
                          >
                            <FaCopy className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => toggleLogPanel(agent.id)}
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                            title="הצג לוגים"
                          >
                            <FaTerminal className="w-4 h-4" />
                          </button>
                          
                          <Link
                            href={`/agent/${agent.id}?tab=settings`}
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                            title="הגדרות סוכן"
                          >
                            <FaCogs className="w-4 h-4" />
                          </Link>
                          
                          <Link
                            href={`/edit-agent/${agent.id}`}
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                            title="ערוך"
                          >
                            <FaEdit className="w-4 h-4" />
                          </Link>
                          
                          <button
                            onClick={() => openDeleteModal(agent)}
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                            title="מחק"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                      
                      {/* חלונית לוגים */}
                      {openLogPanelId === agent.id && (
                        <tr>
                          <td colSpan="6" className="p-0">
                            <LogPanel agentId={agent.id} onClose={closeLogPanel} />
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                      {loading ? (
                        <div className="flex justify-center items-center">
                          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2"></div>
                          <span>טוען סוכנים...</span>
                        </div>
                      ) : error ? (
                        <div className="text-gray-600">
                          <p className="mb-2">שגיאה בטעינת הסוכנים</p>
                          <p className="text-sm">{error}</p>
                        </div>
                      ) : (
                        <div className="text-gray-600">
                          <p className="mb-2">לא נמצאו סוכנים</p>
                          <p className="text-sm">צור סוכן חדש כדי להתחיל</p>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
      
      {/* חלון מודאלי לאישור מחיקה */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-5 border border-gray-300 w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
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
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300"
                >
                  ביטול
                </button>
                <button
                  onClick={handleDeleteAgent}
                  className="px-4 py-2 bg-black text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  מחק
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* אזור אנליטיקה */}
      <motion.div 
        className="container mx-auto px-4 py-8 mb-12"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div 
          className="flex justify-between items-center mb-6"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-bold text-black">אנליטיקה וביצועים</h2>
          <div className="flex gap-4 items-center">
            <select
              className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm text-black focus:outline-none focus:ring-1 focus:ring-gray-300"
              value={selectedAnalyticsAgentId}
              onChange={(e) => setSelectedAnalyticsAgentId(e.target.value)}
              dir="rtl"
            >
              <option value="all">כל הסוכנים</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
            
            <select
              className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm text-black focus:outline-none focus:ring-1 focus:ring-gray-300"
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              dir="rtl"
            >
              <option value="7">7 ימים אחרונים</option>
              <option value="30">30 ימים אחרונים</option>
              <option value="90">90 ימים אחרונים</option>
            </select>
          </div>
        </motion.div>

        {/* כרטיסי אנליטיקה */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={itemVariants}
        >
          <Card className="border border-gray-300 shadow-none">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">זמן תגובה ממוצע</p>
                <p className="text-2xl font-semibold mt-1">{filteredAnalytics.responseTime} שניות</p>
                <p className="text-xs text-green-600 mt-1">↑ 12% מהשבוע שעבר</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-md">
                <FaClock className="h-6 w-6 text-black" />
              </div>
            </div>
          </Card>
          
          <Card className="border border-gray-300 shadow-none">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">זמן השלמת פעולה בחנות</p>
                <p className="text-2xl font-semibold mt-1">{filteredAnalytics.completionTime} שניות</p>
                <p className="text-xs text-green-600 mt-1">↑ 8% מהשבוע שעבר</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-md">
                <FaShoppingCart className="h-6 w-6 text-black" />
              </div>
            </div>
          </Card>
          
          <Card className="border border-gray-300 shadow-none">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">דיוק תשובות</p>
                <p className="text-2xl font-semibold mt-1">{filteredAnalytics.accuracy}%</p>
                <p className="text-xs text-green-600 mt-1">↑ 3.5% מהשבוע שעבר</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-md">
                <FaRobot className="h-6 w-6 text-black" />
              </div>
            </div>
          </Card>
          
          <Card className="border border-gray-300 shadow-none">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">שיעור המרה</p>
                <p className="text-2xl font-semibold mt-1">{filteredAnalytics.conversionRate}%</p>
                <p className="text-xs text-green-600 mt-1">↑ 0.5% מהשבוע שעבר</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-md">
                <FaChartLine className="h-6 w-6 text-black" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* גרפים */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          variants={itemVariants}
        >
          <Card className="border border-gray-300 shadow-none">
            <h3 className="text-lg font-semibold mb-4">
              {selectedAnalyticsAgentId === 'all' 
                ? 'זמני תגובה לפי סוכן' 
                : `זמני תגובה - ${agents.find(a => a.id === selectedAnalyticsAgentId)?.name || ''}`
              }
            </h3>
            <div className="h-64 flex items-center justify-center">
              {selectedAnalyticsAgentId === 'all' ? (
                // תצוגת השוואה בין כל הסוכנים
                <div className="w-full h-full flex flex-col justify-end">
                  <div className="flex items-end justify-between h-48 border-b border-gray-200">
                    {/* סוכן 1 */}
                    <div className="flex flex-col items-center w-1/5">
                      <div className="relative w-12 bg-blue-500 rounded-t-sm" style={{ height: '65%' }}>
                        <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">2.4s</span>
                      </div>
                      <p className="text-xs mt-2 text-gray-600">סוכן מידע</p>
                    </div>
                    {/* סוכן 2 */}
                    <div className="flex flex-col items-center w-1/5">
                      <div className="relative w-12 bg-blue-500 rounded-t-sm" style={{ height: '80%' }}>
                        <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">1.8s</span>
                      </div>
                      <p className="text-xs mt-2 text-gray-600">סוכן טכני</p>
                    </div>
                    {/* סוכן 3 */}
                    <div className="flex flex-col items-center w-1/5">
                      <div className="relative w-12 bg-blue-500 rounded-t-sm" style={{ height: '45%' }}>
                        <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">3.2s</span>
                      </div>
                      <p className="text-xs mt-2 text-gray-600">סוכן מכירות</p>
                    </div>
                    {/* סוכן 4 */}
                    <div className="flex flex-col items-center w-1/5">
                      <div className="relative w-12 bg-blue-500 rounded-t-sm" style={{ height: '70%' }}>
                        <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">2.1s</span>
                      </div>
                      <p className="text-xs mt-2 text-gray-600">סוכן תמיכה</p>
                    </div>
                    {/* סוכן 5 */}
                    <div className="flex flex-col items-center w-1/5">
                      <div className="relative w-12 bg-blue-500 rounded-t-sm" style={{ height: '55%' }}>
                        <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">2.8s</span>
                      </div>
                      <p className="text-xs mt-2 text-gray-600">סוכן שירות</p>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-500">מהיר יותר</span>
                    <span className="text-xs text-gray-500">איטי יותר</span>
                  </div>
                </div>
              ) : (
                // תצוגת מגמה לסוכן ספציפי
                <div className="w-full h-full flex flex-col justify-end">
                  <div className="relative h-48 w-full">
                    {/* קו מגמה */}
                    <svg className="w-full h-full" viewBox="0 0 100 48" preserveAspectRatio="none">
                      {/* קו רקע אופקי */}
                      <line x1="0" y1="24" x2="100" y2="24" stroke="#e5e7eb" strokeWidth="0.5" />
                      <line x1="0" y1="12" x2="100" y2="12" stroke="#e5e7eb" strokeWidth="0.5" />
                      <line x1="0" y1="36" x2="100" y2="36" stroke="#e5e7eb" strokeWidth="0.5" />
                      
                      {/* קו מגמה - נתונים שונים לכל סוכן */}
                      {selectedAnalyticsAgentId === '1' && (
                        <path 
                          d="M0,30 L14.29,25 L28.57,28 L42.86,20 L57.14,15 L71.43,18 L85.71,12 L100,8" 
                          fill="none" 
                          stroke="#3B82F6" 
                          strokeWidth="2"
                        />
                      )}
                      {selectedAnalyticsAgentId === '2' && (
                        <path 
                          d="M0,20 L14.29,18 L28.57,15 L42.86,12 L57.14,10 L71.43,8 L85.71,6 L100,5" 
                          fill="none" 
                          stroke="#3B82F6" 
                          strokeWidth="2"
                        />
                      )}
                      {selectedAnalyticsAgentId === '3' && (
                        <path 
                          d="M0,35 L14.29,32 L28.57,34 L42.86,30 L57.14,32 L71.43,28 L85.71,25 L100,20" 
                          fill="none" 
                          stroke="#3B82F6" 
                          strokeWidth="2"
                        />
                      )}
                      {selectedAnalyticsAgentId === '4' && (
                        <path 
                          d="M0,25 L14.29,22 L28.57,20 L42.86,18 L57.14,15 L71.43,16 L85.71,12 L100,10" 
                          fill="none" 
                          stroke="#3B82F6" 
                          strokeWidth="2"
                        />
                      )}
                      {selectedAnalyticsAgentId === '5' && (
                        <path 
                          d="M0,32 L14.29,30 L28.57,28 L42.86,25 L57.14,26 L71.43,22 L85.71,20 L100,18" 
                          fill="none" 
                          stroke="#3B82F6" 
                          strokeWidth="2"
                        />
                      )}
                      
                      {/* אזור מילוי */}
                      <defs>
                        <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                    
                    {/* תוויות ציר X */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between">
                      <span className="text-xs text-gray-500">יום א׳</span>
                      <span className="text-xs text-gray-500">יום ב׳</span>
                      <span className="text-xs text-gray-500">יום ג׳</span>
                      <span className="text-xs text-gray-500">יום ד׳</span>
                      <span className="text-xs text-gray-500">יום ה׳</span>
                      <span className="text-xs text-gray-500">יום ו׳</span>
                      <span className="text-xs text-gray-500">שבת</span>
                    </div>
                    
                    {/* תוויות ציר Y */}
                    <div className="absolute top-0 bottom-0 left-0 flex flex-col justify-between items-start">
                      <span className="text-xs text-gray-500">4s</span>
                      <span className="text-xs text-gray-500">2s</span>
                      <span className="text-xs text-gray-500">0s</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
          
          <Card className="border border-gray-300 shadow-none">
            <h3 className="text-lg font-semibold mb-4">
              {selectedAnalyticsAgentId === 'all' 
                ? 'פעולות בחנות לפי שעות היום' 
                : `פעולות בחנות - ${agents.find(a => a.id === selectedAnalyticsAgentId)?.name || ''}`
              }
            </h3>
            <div className="h-64 flex items-center justify-center">
              <div className="w-full h-full flex flex-col justify-end">
                <div className="flex items-end h-48 border-b border-gray-200">
                  {/* נתונים שונים לכל סוכן */}
                  {selectedAnalyticsAgentId === 'all' && [
                    5, 3, 2, 2, 4, 8, 15, 25, 38, 45, 42, 48, 
                    52, 45, 38, 42, 48, 52, 45, 32, 25, 18, 12, 8
                  ].map((value, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div 
                        className="relative w-2 bg-gray-600 rounded-t-sm" 
                        style={{ height: `${value}%` }}
                      >
                        {value > 40 && (
                          <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600">{value}</span>
                        )}
                      </div>
                      {i % 4 === 0 && (
                        <p className="text-xs mt-2 text-gray-600">{i}:00</p>
                      )}
                    </div>
                  ))}
                  
                  {selectedAnalyticsAgentId === '1' && [
                    3, 2, 1, 1, 2, 5, 10, 18, 30, 35, 32, 38, 
                    42, 35, 28, 32, 38, 42, 35, 25, 18, 12, 8, 5
                  ].map((value, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div 
                        className="relative w-2 bg-gray-600 rounded-t-sm" 
                        style={{ height: `${value}%` }}
                      >
                        {value > 40 && (
                          <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600">{value}</span>
                        )}
                      </div>
                      {i % 4 === 0 && (
                        <p className="text-xs mt-2 text-gray-600">{i}:00</p>
                      )}
                    </div>
                  ))}
                  
                  {selectedAnalyticsAgentId === '2' && [
                    8, 5, 3, 2, 5, 10, 20, 35, 48, 55, 52, 58, 
                    62, 55, 48, 52, 58, 62, 55, 42, 35, 25, 15, 10
                  ].map((value, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div 
                        className="relative w-2 bg-gray-600 rounded-t-sm" 
                        style={{ height: `${value}%` }}
                      >
                        {value > 40 && (
                          <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600">{value}</span>
                        )}
                      </div>
                      {i % 4 === 0 && (
                        <p className="text-xs mt-2 text-gray-600">{i}:00</p>
                      )}
                    </div>
                  ))}
                  
                  {selectedAnalyticsAgentId === '3' && [
                    4, 2, 1, 1, 3, 7, 12, 22, 32, 38, 35, 42, 
                    45, 38, 32, 35, 42, 45, 38, 28, 22, 15, 10, 6
                  ].map((value, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div 
                        className="relative w-2 bg-gray-600 rounded-t-sm" 
                        style={{ height: `${value}%` }}
                      >
                        {value > 40 && (
                          <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600">{value}</span>
                        )}
                      </div>
                      {i % 4 === 0 && (
                        <p className="text-xs mt-2 text-gray-600">{i}:00</p>
                      )}
                    </div>
                  ))}
                  
                  {selectedAnalyticsAgentId === '4' && [
                    6, 4, 2, 2, 5, 9, 18, 28, 42, 48, 45, 52, 
                    55, 48, 42, 45, 52, 55, 48, 35, 28, 20, 12, 8
                  ].map((value, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div 
                        className="relative w-2 bg-gray-600 rounded-t-sm" 
                        style={{ height: `${value}%` }}
                      >
                        {value > 40 && (
                          <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600">{value}</span>
                        )}
                      </div>
                      {i % 4 === 0 && (
                        <p className="text-xs mt-2 text-gray-600">{i}:00</p>
                      )}
                    </div>
                  ))}
                  
                  {selectedAnalyticsAgentId === '5' && [
                    4, 3, 2, 2, 4, 8, 15, 25, 35, 40, 38, 45, 
                    48, 40, 35, 38, 45, 48, 40, 30, 25, 18, 10, 7
                  ].map((value, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div 
                        className="relative w-2 bg-gray-600 rounded-t-sm" 
                        style={{ height: `${value}%` }}
                      >
                        {value > 40 && (
                          <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600">{value}</span>
                        )}
                      </div>
                      {i % 4 === 0 && (
                        <p className="text-xs mt-2 text-gray-600">{i}:00</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-500">פחות פעולות</span>
                  <span className="text-xs text-gray-500">יותר פעולות</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default withAuth(Dashboard);
