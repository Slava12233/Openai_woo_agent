'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  getAgents, 
  getAgentById, 
  createAgent, 
  updateAgent, 
  deleteAgent,
  getAgentStats,
  getAgentLogs,
  getAgentConversations,
  getAgentShareLink
} from '../utils/api';

// יצירת קונטקסט הסוכנים
const AgentContext = createContext({});

// פרובידר הסוכנים
export function AgentProvider({ children }) {
  const [agents, setAgents] = useState([
    {
      id: '1',
      name: 'סוכן מידע',
      storeUrl: 'infostore.com',
      platform: 'טלגרם',
      status: 'לא פעיל',
      createdAt: '2023-06-05T10:30:00.000Z',
      description: 'סוכן המספק מידע על מוצרים ושירותים בחנות',
      apiKey: 'sk-info-123456',
      welcomeMessage: 'שלום! אני סוכן המידע של החנות. כיצד אוכל לעזור לך היום?',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 1024
    },
    {
      id: '2',
      name: 'סוכן טכני',
      storeUrl: 'techstore.com',
      platform: 'וואטסאפ',
      status: 'פעיל',
      createdAt: '2023-10-20T14:45:00.000Z',
      description: 'סוכן המספק תמיכה טכנית למוצרים אלקטרוניים',
      apiKey: 'sk-tech-789012',
      welcomeMessage: 'שלום! אני כאן כדי לעזור לך עם כל שאלה טכנית. במה אוכל לסייע?',
      model: 'gpt-4',
      temperature: 0.5,
      maxTokens: 2048
    },
    {
      id: '3',
      name: 'סוכן מכירות',
      storeUrl: 'mystore.com',
      platform: 'טלגרם',
      status: 'פעיל',
      createdAt: '2023-12-15T09:15:00.000Z',
      description: 'סוכן המסייע בתהליך הרכישה ומספק המלצות מוצרים',
      apiKey: 'sk-sales-345678',
      welcomeMessage: 'היי! אשמח לעזור לך למצוא את המוצר המושלם. מה אתה מחפש היום?',
      model: 'gpt-4',
      temperature: 0.8,
      maxTokens: 1536
    },
    {
      id: '4',
      name: 'סוכן תמיכה',
      storeUrl: 'supportstore.com',
      platform: 'וואטסאפ',
      status: 'פעיל',
      createdAt: '2024-01-10T11:20:00.000Z',
      description: 'סוכן המטפל בשאלות ובעיות של לקוחות',
      apiKey: 'sk-support-901234',
      welcomeMessage: 'שלום וברוכים הבאים לתמיכת הלקוחות שלנו. כיצד אוכל לסייע לך היום?',
      model: 'gpt-4',
      temperature: 0.6,
      maxTokens: 1024
    },
    {
      id: '5',
      name: 'סוכן שירות',
      storeUrl: 'servicestore.com',
      platform: 'טלגרם',
      status: 'לא פעיל',
      createdAt: '2024-02-25T16:30:00.000Z',
      description: 'סוכן המטפל בהזמנות, משלוחים והחזרות',
      apiKey: 'sk-service-567890',
      welcomeMessage: 'שלום! אני כאן כדי לעזור לך עם הזמנות, משלוחים והחזרות. במה אוכל לסייע?',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 1536
    }
  ]);

  const [currentAgent, setCurrentAgent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalInteractions: 2680,
    totalStores: 5,
    activeAgents: 3,
    inactiveAgents: 2,
    averageResponseTime: 2.4,
    averageCompletionTime: 5.7,
    responseAccuracy: 94.2,
    conversionRate: 3.8
  });
  
  // שימוש ב-useRef כדי למנוע לולאות אינסופיות
  const initialized = useRef(false);

  // נתונים מדומים לסביבת פיתוח
  const mockAgents = [
    {
      id: 1,
      name: 'סוכן מכירות',
      description: 'סוכן AI לעזרה במכירות ושירות לקוחות',
      status: 'פעיל',
      platform: 'טלגרם',
      storeUrl: 'mystore.com',
      conversationsCount: 1250,
      conversations: 1250,
      growth: 12,
      createdAt: '2023-01-15T10:30:00Z',
      updatedAt: '2023-03-10T14:45:00Z'
    },
    {
      id: 2,
      name: 'סוכן תמיכה',
      description: 'סוכן AI לתמיכה טכנית ופתרון בעיות',
      status: 'פעיל',
      platform: 'וואטסאפ',
      storeUrl: 'techstore.com',
      conversationsCount: 980,
      conversations: 980,
      growth: 8,
      createdAt: '2023-02-20T09:15:00Z',
      updatedAt: '2023-03-12T11:30:00Z'
    },
    {
      id: 3,
      name: 'סוכן מידע',
      description: 'סוכן AI למתן מידע על מוצרים ושירותים',
      status: 'לא פעיל',
      platform: 'טלגרם',
      storeUrl: 'infostore.com',
      conversationsCount: 450,
      conversations: 450,
      growth: 5,
      createdAt: '2023-03-05T13:45:00Z',
      updatedAt: '2023-03-15T16:20:00Z'
    }
  ];

  // טעינת רשימת הסוכנים בטעינת הדף - גרסת פיתוח
  useEffect(() => {
    // מניעת טעינה מחדש אם כבר יש נתונים או אם כבר אתחלנו
    if (!initialized.current) {
      initialized.current = true;
      fetchAgents();
    }
  }, []);

  // פונקציה לטעינת רשימת הסוכנים - גרסת פיתוח
  const fetchAgents = async () => {
    // מניעת קריאות כפולות
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      // ניסיון לקרוא מה-API
      try {
        const data = await getAgents();
        setAgents(data);
        
        // חישוב סטטיסטיקות בסיסיות
        const activeAgents = data.filter(agent => agent.status === 'פעיל').length;
        const totalConversations = data.reduce((sum, agent) => sum + (agent.conversationsCount || 0), 0);
        
        setStats({
          totalInteractions: totalConversations,
          totalStores: data.length,
          activeAgents,
          inactiveAgents: data.length - activeAgents
        });
        
      } catch (apiError) {
        console.log('[INFO] DEV MODE: Returning mock agents data');
        
        // במצב פיתוח - החזרת נתונים מדומים
        setAgents(mockAgents);
        
        // חישוב סטטיסטיקות בסיסיות
        const activeAgents = mockAgents.filter(agent => agent.status === 'פעיל').length;
        const totalConversations = mockAgents.reduce((sum, agent) => sum + (agent.conversationsCount || 0), 0);
        
        setStats({
          totalInteractions: totalConversations,
          totalStores: mockAgents.length,
          activeAgents,
          inactiveAgents: mockAgents.length - activeAgents
        });
      }
    } catch (err) {
      setError('שגיאה בטעינת רשימת הסוכנים');
      console.error('Error fetching agents:', err);
    } finally {
      setLoading(false);
    }
  };

  // פונקציה לטעינת סוכן לפי מזהה - גרסת פיתוח
  const fetchAgentById = async (id) => {
    // אם הסוכן כבר נטען ויש לו את אותו מזהה, אין צורך לטעון שוב
    if (currentAgent && currentAgent.id === parseInt(id)) {
      return currentAgent;
    }
    
    setLoading(true);
    setError(null);

    try {
      // ניסיון לקרוא מה-API
      try {
        const data = await getAgentById(id);
        setCurrentAgent(data);
        return data;
      } catch (apiError) {
        console.log('API not available in development mode, using mock data');
        
        // חיפוש הסוכן בנתונים המדומים
        const mockAgent = mockAgents.find(agent => agent.id === parseInt(id));
        
        if (mockAgent) {
          setCurrentAgent(mockAgent);
          return mockAgent;
        } else {
          throw new Error('סוכן לא נמצא');
        }
      }
    } catch (error) {
      setError(error.message || 'שגיאה בטעינת פרטי הסוכן');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // פונקציה ליצירת סוכן חדש - גרסת פיתוח
  const addAgent = async (agentData) => {
    setLoading(true);
    setError(null);

    try {
      // ניסיון לקרוא מה-API
      try {
        const data = await createAgent(agentData);
        setAgents(prevAgents => [...prevAgents, data]);
        
        // עדכון סטטיסטיקות
        setStats(prevStats => ({
          ...prevStats,
          totalStores: prevStats.totalStores + 1,
          activeAgents: data.status === 'פעיל' ? prevStats.activeAgents + 1 : prevStats.activeAgents,
        }));
        
        return data;
      } catch (apiError) {
        console.log('API not available in development mode, using mock data');
        
        // יצירת סוכן מדומה חדש
        const newMockAgent = {
          id: mockAgents.length > 0 ? Math.max(...mockAgents.map(a => a.id)) + 1 : 1,
          ...agentData,
          conversationsCount: 0,
          conversations: 0,
          growth: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // הוספת הסוכן החדש לרשימה
        const updatedAgents = [...agents, newMockAgent];
        setAgents(updatedAgents);
        
        // עדכון סטטיסטיקות
        setStats(prevStats => ({
          ...prevStats,
          totalStores: prevStats.totalStores + 1,
          activeAgents: newMockAgent.status === 'פעיל' ? prevStats.activeAgents + 1 : prevStats.activeAgents,
        }));
        
        return newMockAgent;
      }
    } catch (error) {
      setError(error.message || 'שגיאה ביצירת סוכן חדש');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // פונקציה לעדכון סוכן קיים - גרסת פיתוח
  const editAgent = async (id, agentData) => {
    setLoading(true);
    setError(null);

    try {
      // ניסיון לקרוא מה-API
      try {
        const data = await updateAgent(id, agentData);
        
        // עדכון רשימת הסוכנים
        setAgents(prevAgents => 
          prevAgents.map(agent => 
            agent.id === id ? { ...agent, ...data } : agent
          )
        );
        
        // עדכון הסוכן הנוכחי אם הוא הסוכן שעודכן
        if (currentAgent && currentAgent.id === id) {
          setCurrentAgent({ ...currentAgent, ...data });
        }
        
        // עדכון סטטיסטיקות אם הסטטוס השתנה
        if (currentAgent && currentAgent.status !== data.status) {
          setStats(prevStats => ({
            ...prevStats,
            activeAgents: 
              data.status === 'פעיל' ? prevStats.activeAgents + 1 : 
              currentAgent.status === 'פעיל' ? prevStats.activeAgents - 1 : 
              prevStats.activeAgents,
          }));
        }
        
        return data;
      } catch (apiError) {
        console.log('API not available in development mode, using mock data');
        
        // חיפוש הסוכן בנתונים הקיימים
        const agentToUpdate = agents.find(agent => agent.id === parseInt(id));
        
        if (!agentToUpdate) {
          throw new Error('סוכן לא נמצא');
        }
        
        // עדכון הסוכן
        const updatedAgent = {
          ...agentToUpdate,
          ...agentData,
          updatedAt: new Date().toISOString()
        };
        
        // עדכון רשימת הסוכנים
        setAgents(prevAgents => 
          prevAgents.map(agent => 
            agent.id === parseInt(id) ? updatedAgent : agent
          )
        );
        
        // עדכון הסוכן הנוכחי אם הוא הסוכן שעודכן
        if (currentAgent && currentAgent.id === parseInt(id)) {
          setCurrentAgent(updatedAgent);
        }
        
        // עדכון סטטיסטיקות אם הסטטוס השתנה
        if (agentToUpdate.status !== agentData.status) {
          setStats(prevStats => ({
            ...prevStats,
            activeAgents: 
              agentData.status === 'פעיל' ? prevStats.activeAgents + 1 : 
              agentToUpdate.status === 'פעיל' ? prevStats.activeAgents - 1 : 
              prevStats.activeAgents,
          }));
        }
        
        return updatedAgent;
      }
    } catch (error) {
      setError(error.message || 'שגיאה בעדכון הסוכן');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // פונקציה למחיקת סוכן - גרסת פיתוח
  const removeAgent = async (id) => {
    setLoading(true);
    setError(null);

    try {
      // ניסיון לקרוא מה-API
      try {
        await deleteAgent(id);
        
        // מציאת הסוכן לפני המחיקה לצורך עדכון סטטיסטיקות
        const agentToRemove = agents.find(agent => agent.id === id);
        
        // עדכון רשימת הסוכנים
        setAgents(prevAgents => prevAgents.filter(agent => agent.id !== id));
        
        // עדכון סטטיסטיקות
        if (agentToRemove) {
          setStats(prevStats => ({
            ...prevStats,
            totalStores: prevStats.totalStores - 1,
            activeAgents: agentToRemove.status === 'פעיל' ? prevStats.activeAgents - 1 : prevStats.activeAgents,
            totalInteractions: prevStats.totalInteractions - (agentToRemove.conversationsCount || 0),
          }));
        }
        
        // איפוס הסוכן הנוכחי אם הוא הסוכן שנמחק
        if (currentAgent && currentAgent.id === id) {
          setCurrentAgent(null);
        }
        
        return true;
      } catch (apiError) {
        console.log('API not available in development mode, using mock data');
        
        // מציאת הסוכן לפני המחיקה לצורך עדכון סטטיסטיקות
        const agentToRemove = agents.find(agent => agent.id === parseInt(id));
        
        if (!agentToRemove) {
          throw new Error('סוכן לא נמצא');
        }
        
        // עדכון רשימת הסוכנים
        setAgents(prevAgents => prevAgents.filter(agent => agent.id !== parseInt(id)));
        
        // עדכון סטטיסטיקות
        setStats(prevStats => ({
          ...prevStats,
          totalStores: prevStats.totalStores - 1,
          activeAgents: agentToRemove.status === 'פעיל' ? prevStats.activeAgents - 1 : prevStats.activeAgents,
          totalInteractions: prevStats.totalInteractions - (agentToRemove.conversationsCount || 0),
        }));
        
        // איפוס הסוכן הנוכחי אם הוא הסוכן שנמחק
        if (currentAgent && currentAgent.id === parseInt(id)) {
          setCurrentAgent(null);
        }
        
        return true;
      }
    } catch (error) {
      setError(error.message || 'שגיאה במחיקת הסוכן');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // פונקציה לקבלת סטטיסטיקות של סוכן - גרסת פיתוח
  const fetchAgentStats = async (id, params = {}) => {
    setLoading(true);
    setError(null);

    try {
      // ניסיון לקרוא מה-API
      try {
        const data = await getAgentStats(id, params);
        return data;
      } catch (apiError) {
        console.log('API not available in development mode, using mock data');
        
        // חיפוש הסוכן בנתונים הקיימים
        const agent = agents.find(agent => agent.id === parseInt(id));
        
        if (!agent) {
          throw new Error('סוכן לא נמצא');
        }
        
        // יצירת נתונים מדומים לסטטיסטיקות
        const mockStats = {
          totalInteractions: agent.conversationsCount || 0,
          dailyInteractions: [
            { date: '2023-03-10', count: 45 },
            { date: '2023-03-11', count: 52 },
            { date: '2023-03-12', count: 48 },
            { date: '2023-03-13', count: 60 },
            { date: '2023-03-14', count: 55 },
            { date: '2023-03-15', count: 70 },
            { date: '2023-03-16', count: 65 }
          ],
          averageResponseTime: 1.8, // בשניות
          topQuestions: [
            { question: 'מה המחיר של המוצר?', count: 120 },
            { question: 'האם יש משלוח חינם?', count: 85 },
            { question: 'כמה זמן לוקח המשלוח?', count: 72 },
            { question: 'האם המוצר במלאי?', count: 65 },
            { question: 'מה תנאי ההחזרה?', count: 58 }
          ],
          userSatisfaction: 4.7, // מתוך 5
          conversionRate: 0.12 // 12%
        };
        
        return mockStats;
      }
    } catch (error) {
      setError(error.message || 'שגיאה בקבלת סטטיסטיקות הסוכן');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // פונקציה לקבלת לוגים של סוכן - גרסת פיתוח
  const fetchAgentLogs = async (id, params = {}) => {
    setLoading(true);
    setError(null);

    try {
      // ניסיון לקרוא מה-API
      try {
        const data = await getAgentLogs(id, params);
        return data;
      } catch (apiError) {
        console.log('API not available in development mode, using mock data');
        
        // יצירת נתונים מדומים ללוגים
        const mockLogs = [
          { id: 1, agentId: parseInt(id), type: 'info', message: 'הסוכן הופעל', timestamp: '2023-03-16T08:30:00Z' },
          { id: 2, agentId: parseInt(id), type: 'info', message: 'שיחה חדשה התחילה', timestamp: '2023-03-16T09:15:22Z' },
          { id: 3, agentId: parseInt(id), type: 'warning', message: 'בקשה לא תקינה התקבלה', timestamp: '2023-03-16T10:05:47Z' },
          { id: 4, agentId: parseInt(id), type: 'error', message: 'שגיאה בחיבור ל-API', timestamp: '2023-03-16T11:30:15Z' },
          { id: 5, agentId: parseInt(id), type: 'info', message: 'שיחה חדשה התחילה', timestamp: '2023-03-16T12:45:33Z' },
          { id: 6, agentId: parseInt(id), type: 'info', message: 'הזמנה חדשה נוצרה', timestamp: '2023-03-16T13:20:10Z' },
          { id: 7, agentId: parseInt(id), type: 'info', message: 'שיחה הסתיימה', timestamp: '2023-03-16T14:05:55Z' },
          { id: 8, agentId: parseInt(id), type: 'warning', message: 'זמן תגובה ארוך', timestamp: '2023-03-16T15:30:42Z' },
          { id: 9, agentId: parseInt(id), type: 'info', message: 'שיחה חדשה התחילה', timestamp: '2023-03-16T16:15:18Z' },
          { id: 10, agentId: parseInt(id), type: 'info', message: 'שיחה הסתיימה', timestamp: '2023-03-16T17:00:05Z' }
        ];
        
        return {
          logs: mockLogs,
          total: mockLogs.length,
          page: 1,
          pageSize: 10,
          totalPages: 1
        };
      }
    } catch (error) {
      setError(error.message || 'שגיאה בקבלת לוגים של הסוכן');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // פונקציה לקבלת שיחות של סוכן - גרסת פיתוח
  const fetchAgentConversations = async (id, params = {}) => {
    setLoading(true);
    setError(null);

    try {
      // ניסיון לקרוא מה-API
      try {
        const data = await getAgentConversations(id, params);
        return data;
      } catch (apiError) {
        console.log('API not available in development mode, using mock data');
        
        // יצירת נתונים מדומים לשיחות
        const mockConversations = [
          {
            id: 1,
            agentId: parseInt(id),
            userId: 'user123',
            userName: 'ישראל ישראלי',
            startTime: '2023-03-16T09:15:22Z',
            endTime: '2023-03-16T09:25:45Z',
            messageCount: 8,
            status: 'הסתיים',
            summary: 'שאלות לגבי מחירי מוצרים ומשלוח'
          },
          {
            id: 2,
            agentId: parseInt(id),
            userId: 'user456',
            userName: 'שרה כהן',
            startTime: '2023-03-16T12:45:33Z',
            endTime: '2023-03-16T13:00:10Z',
            messageCount: 12,
            status: 'הסתיים עם הזמנה',
            summary: 'רכישת מוצר והזמנה חדשה'
          },
          {
            id: 3,
            agentId: parseInt(id),
            userId: 'user789',
            userName: 'דוד לוי',
            startTime: '2023-03-16T16:15:18Z',
            endTime: '2023-03-16T16:30:05Z',
            messageCount: 6,
            status: 'הסתיים',
            summary: 'שאלות לגבי מדיניות החזרות'
          },
          {
            id: 4,
            agentId: parseInt(id),
            userId: 'user101',
            userName: 'רחל אברהם',
            startTime: '2023-03-16T18:20:30Z',
            endTime: null,
            messageCount: 3,
            status: 'פעיל',
            summary: 'שאלות לגבי זמני אספקה'
          }
        ];
        
        return {
          conversations: mockConversations,
          total: mockConversations.length,
          page: 1,
          pageSize: 10,
          totalPages: 1
        };
      }
    } catch (error) {
      setError(error.message || 'שגיאה בקבלת שיחות של הסוכן');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // פונקציה לקבלת לינק שיתוף של סוכן - גרסת פיתוח
  const fetchAgentShareLink = async (id) => {
    setLoading(true);
    setError(null);

    try {
      // ניסיון לקרוא מה-API
      try {
        const data = await getAgentShareLink(id);
        return data;
      } catch (apiError) {
        console.log('API not available in development mode, using mock data');
        
        // יצירת לינק שיתוף מדומה
        const agent = agents.find(agent => agent.id === parseInt(id));
        
        if (!agent) {
          throw new Error('סוכן לא נמצא');
        }
        
        const platform = agent.platform === 'טלגרם' ? 't.me' : 'wa.me';
        const mockShareLink = `https://${platform}/wooagent_${id}?start=share`;
        
        return {
          shareLink: mockShareLink,
          qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==`
        };
      }
    } catch (error) {
      setError(error.message || 'שגיאה בקבלת לינק שיתוף של הסוכן');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // פונקציה לעדכון הסטטיסטיקות
  const updateStats = (newStats) => {
    setStats(prevStats => ({
      ...prevStats,
      ...newStats
    }));
  };

  // ערך הקונטקסט
  const value = {
    agents,
    currentAgent,
    loading,
    error,
    stats,
    fetchAgents,
    fetchAgentById,
    addAgent,
    editAgent,
    removeAgent,
    fetchAgentStats,
    fetchAgentLogs,
    fetchAgentConversations,
    fetchAgentShareLink,
    updateStats
  };

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>;
}

// הוק לשימוש בקונטקסט הסוכנים
export const useAgents = () => useContext(AgentContext);
