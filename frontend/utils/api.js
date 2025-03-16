/**
 * קובץ המכיל פונקציות לתקשורת עם ה-API
 */

import axios from 'axios';
import logger from './logger';

// האם לעבוד במצב פיתוח מקומי (ללא שרת API)
const DEV_MODE = process.env.NODE_ENV === 'development';

// יצירת מופע axios עם הגדרות בסיסיות
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// הוספת interceptor לטיפול בטוקן אימות
api.interceptors.request.use(
  (config) => {
    // לוג של הבקשה
    logger.debug(`API Request: ${config.method.toUpperCase()} ${config.url}`, config);
    
    // הוספת טוקן אימות אם קיים
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      logger.warn('Failed to get token from localStorage', error);
    }
    
    return config;
  },
  (error) => {
    logger.error('API Request Error', error);
    return Promise.reject(error);
  }
);

// הוספת interceptor לטיפול בשגיאות
api.interceptors.response.use(
  (response) => {
    logger.debug(`API Response: ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    // טיפול בשגיאת אימות (401)
    if (error.response && error.response.status === 401) {
      try {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } catch (e) {
        logger.error('Failed to handle 401 error', e);
      }
    }
    
    logger.error(`API Error: ${error.config?.method?.toUpperCase() || 'UNKNOWN'} ${error.config?.url || 'UNKNOWN'}`, error);
    return Promise.reject(error);
  }
);

// פונקציות API

/**
 * התחברות למערכת
 * @param {Object} credentials פרטי התחברות
 * @returns {Promise} תוצאת הבקשה
 */
export const login = async (credentials) => {
  // במצב פיתוח, החזר נתונים מדומים
  if (DEV_MODE) {
    logger.info('DEV MODE: Simulating login', { email: credentials.email });
    
    // יצירת טוקן מדומה
    const token = 'dev-token-123456';
    localStorage.setItem('token', token);
    
    return {
      user: mockData.user,
      token: token
    };
  }
  
  try {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'שגיאה בהתחברות' };
  }
};

/**
 * יציאה מהמערכת
 */
export const logout = () => {
  if (DEV_MODE) {
    logger.info('DEV MODE: Simulating logout');
  }
  
  localStorage.removeItem('token');
  window.location.href = '/login';
};

/**
 * קבלת פרטי המשתמש המחובר
 * @returns {Promise} תוצאת הבקשה
 */
export const getCurrentUser = async () => {
  // במצב פיתוח, החזר נתונים מדומים
  if (DEV_MODE) {
    logger.info('DEV MODE: Returning mock user data');
    return mockData.user;
  }
  
  try {
    const response = await api.get('/users/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'שגיאה בקבלת פרטי משתמש' };
  }
};

/**
 * עדכון פרטי המשתמש
 * @param {Object} userData פרטי המשתמש לעדכון
 * @returns {Promise} תוצאת הבקשה
 */
export const updateUser = async (userData) => {
  // במצב פיתוח, החזר נתונים מדומים
  if (DEV_MODE) {
    logger.info('DEV MODE: Updating mock user data', userData);
    
    // עדכון נתוני המשתמש המדומה
    mockData.user = {
      ...mockData.user,
      ...userData
    };
    
    return mockData.user;
  }
  
  try {
    const response = await api.put('/users/me', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'שגיאה בעדכון פרטי משתמש' };
  }
};

/**
 * שינוי סיסמה
 * @param {Object} passwordData פרטי הסיסמה
 * @returns {Promise} תוצאת הבקשה
 */
export const changePassword = async (passwordData) => {
  // במצב פיתוח, החזר נתונים מדומים
  if (DEV_MODE) {
    logger.info('DEV MODE: Simulating password change');
    return { success: true, message: 'הסיסמה שונתה בהצלחה' };
  }
  
  try {
    const response = await api.post('/users/change-password', passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'שגיאה בשינוי סיסמה' };
  }
};

// נתונים מדומים לסביבת פיתוח
const mockData = {
  agents: [
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
  ],
  user: {
    id: 1,
    name: 'משתמש פיתוח',
    email: 'dev@example.com',
    role: 'admin'
  }
};

// API סוכנים

/**
 * קבלת רשימת הסוכנים
 * @returns {Promise} תוצאת הבקשה
 */
export const getAgents = async () => {
  // במצב פיתוח, החזר נתונים מדומים
  if (DEV_MODE) {
    logger.info('DEV MODE: Returning mock agents data');
    return mockData.agents;
  }
  
  try {
    const response = await api.get('/agents');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'שגיאה בקבלת רשימת סוכנים' };
  }
};

/**
 * קבלת פרטי סוכן לפי מזהה
 * @param {string|number} id מזהה הסוכן
 * @returns {Promise} תוצאת הבקשה
 */
export const getAgentById = async (id) => {
  // במצב פיתוח, החזר נתונים מדומים
  if (DEV_MODE) {
    logger.info(`DEV MODE: Returning mock agent data for ID: ${id}`);
    const agent = mockData.agents.find(a => a.id === parseInt(id));
    if (!agent) {
      throw { message: 'סוכן לא נמצא' };
    }
    return agent;
  }
  
  try {
    const response = await api.get(`/agents/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'שגיאה בקבלת פרטי סוכן' };
  }
};

/**
 * יצירת סוכן חדש
 * @param {Object} agentData פרטי הסוכן
 * @returns {Promise} תוצאת הבקשה
 */
export const createAgent = async (agentData) => {
  // במצב פיתוח, החזר נתונים מדומים
  if (DEV_MODE) {
    logger.info('DEV MODE: Creating mock agent', agentData);
    const newAgent = {
      id: mockData.agents.length > 0 ? Math.max(...mockData.agents.map(a => a.id)) + 1 : 1,
      ...agentData,
      conversationsCount: 0,
      conversations: 0,
      growth: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockData.agents.push(newAgent);
    return newAgent;
  }
  
  try {
    const response = await api.post('/agents', agentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'שגיאה ביצירת סוכן' };
  }
};

/**
 * עדכון פרטי סוכן
 * @param {string|number} id מזהה הסוכן
 * @param {Object} agentData פרטי הסוכן לעדכון
 * @returns {Promise} תוצאת הבקשה
 */
export const updateAgent = async (id, agentData) => {
  // במצב פיתוח, החזר נתונים מדומים
  if (DEV_MODE) {
    logger.info(`DEV MODE: Updating mock agent with ID: ${id}`, agentData);
    const index = mockData.agents.findIndex(a => a.id === parseInt(id));
    if (index === -1) {
      throw { message: 'סוכן לא נמצא' };
    }
    
    const updatedAgent = {
      ...mockData.agents[index],
      ...agentData,
      updatedAt: new Date().toISOString()
    };
    
    mockData.agents[index] = updatedAgent;
    return updatedAgent;
  }
  
  try {
    const response = await api.put(`/agents/${id}`, agentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'שגיאה בעדכון פרטי סוכן' };
  }
};

/**
 * מחיקת סוכן
 * @param {string|number} id מזהה הסוכן
 * @returns {Promise} תוצאת הבקשה
 */
export const deleteAgent = async (id) => {
  // במצב פיתוח, החזר נתונים מדומים
  if (DEV_MODE) {
    logger.info(`DEV MODE: Deleting mock agent with ID: ${id}`);
    const index = mockData.agents.findIndex(a => a.id === parseInt(id));
    if (index === -1) {
      throw { message: 'סוכן לא נמצא' };
    }
    
    mockData.agents.splice(index, 1);
    return { success: true };
  }
  
  try {
    const response = await api.delete(`/agents/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'שגיאה במחיקת סוכן' };
  }
};

/**
 * קבלת לינק שיתוף לסוכן
 * @param {string|number} id מזהה הסוכן
 * @returns {Promise} תוצאת הבקשה
 */
export const getAgentShareLink = async (id) => {
  // במצב פיתוח, החזר נתונים מדומים
  if (DEV_MODE) {
    logger.info(`DEV MODE: Generating mock share link for agent ID: ${id}`);
    const agent = mockData.agents.find(a => a.id === parseInt(id));
    if (!agent) {
      throw { message: 'סוכן לא נמצא' };
    }
    
    const platform = agent.platform === 'טלגרם' ? 't.me' : 'wa.me';
    return {
      shareLink: `https://${platform}/wooagent_${id}?start=share`,
      qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==`
    };
  }
  
  try {
    const response = await api.get(`/agents/${id}/share-link`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'שגיאה בקבלת לינק שיתוף' };
  }
};

// API לוגים ושיחות

/**
 * קבלת רשימת לוגים של סוכן
 * @param {string|number} agentId מזהה הסוכן
 * @param {Object} params פרמטרים לסינון
 * @returns {Promise} תוצאת הבקשה
 */
export const getAgentLogs = async (agentId, params = {}) => {
  // במצב פיתוח, החזר נתונים מדומים
  if (DEV_MODE) {
    logger.info(`DEV MODE: Returning mock logs for agent ID: ${agentId}`);
    
    // יצירת נתונים מדומים ללוגים
    const mockLogs = [
      { id: 1, agentId: parseInt(agentId), type: 'info', message: 'הסוכן הופעל', timestamp: '2023-03-16T08:30:00Z' },
      { id: 2, agentId: parseInt(agentId), type: 'info', message: 'שיחה חדשה התחילה', timestamp: '2023-03-16T09:15:22Z' },
      { id: 3, agentId: parseInt(agentId), type: 'warning', message: 'בקשה לא תקינה התקבלה', timestamp: '2023-03-16T10:05:47Z' },
      { id: 4, agentId: parseInt(agentId), type: 'error', message: 'שגיאה בחיבור ל-API', timestamp: '2023-03-16T11:30:15Z' },
      { id: 5, agentId: parseInt(agentId), type: 'info', message: 'שיחה חדשה התחילה', timestamp: '2023-03-16T12:45:33Z' },
      { id: 6, agentId: parseInt(agentId), type: 'info', message: 'הזמנה חדשה נוצרה', timestamp: '2023-03-16T13:20:10Z' },
      { id: 7, agentId: parseInt(agentId), type: 'info', message: 'שיחה הסתיימה', timestamp: '2023-03-16T14:05:55Z' },
      { id: 8, agentId: parseInt(agentId), type: 'warning', message: 'זמן תגובה ארוך', timestamp: '2023-03-16T15:30:42Z' },
      { id: 9, agentId: parseInt(agentId), type: 'info', message: 'שיחה חדשה התחילה', timestamp: '2023-03-16T16:15:18Z' },
      { id: 10, agentId: parseInt(agentId), type: 'info', message: 'שיחה הסתיימה', timestamp: '2023-03-16T17:00:05Z' }
    ];
    
    return {
      logs: mockLogs,
      total: mockLogs.length,
      page: 1,
      pageSize: 10,
      totalPages: 1
    };
  }
  
  try {
    const response = await api.get(`/agents/${agentId}/logs`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'שגיאה בקבלת לוגים' };
  }
};

/**
 * קבלת רשימת שיחות של סוכן
 * @param {string|number} agentId מזהה הסוכן
 * @param {Object} params פרמטרים לסינון
 * @returns {Promise} תוצאת הבקשה
 */
export const getAgentConversations = async (agentId, params = {}) => {
  // במצב פיתוח, החזר נתונים מדומים
  if (DEV_MODE) {
    logger.info(`DEV MODE: Returning mock conversations for agent ID: ${agentId}`);
    
    // יצירת נתונים מדומים לשיחות
    const mockConversations = [
      {
        id: 1,
        agentId: parseInt(agentId),
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
        agentId: parseInt(agentId),
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
        agentId: parseInt(agentId),
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
        agentId: parseInt(agentId),
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
  
  try {
    const response = await api.get(`/agents/${agentId}/conversations`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'שגיאה בקבלת שיחות' };
  }
};

/**
 * קבלת פרטי שיחה
 * @param {string|number} conversationId מזהה השיחה
 * @returns {Promise} תוצאת הבקשה
 */
export const getConversationById = async (conversationId) => {
  // במצב פיתוח, החזר נתונים מדומים
  if (DEV_MODE) {
    logger.info(`DEV MODE: Returning mock conversation details for ID: ${conversationId}`);
    
    // יצירת נתונים מדומים לשיחה
    const mockConversation = {
      id: parseInt(conversationId),
      agentId: 1,
      userId: 'user123',
      userName: 'ישראל ישראלי',
      startTime: '2023-03-16T09:15:22Z',
      endTime: '2023-03-16T09:25:45Z',
      messageCount: 8,
      status: 'הסתיים',
      summary: 'שאלות לגבי מחירי מוצרים ומשלוח',
      messages: [
        { id: 1, role: 'user', content: 'שלום, אני מעוניין לדעת מה המחיר של המוצר X', timestamp: '2023-03-16T09:15:22Z' },
        { id: 2, role: 'assistant', content: 'שלום! המחיר של מוצר X הוא 199 ש"ח. האם אתה מעוניין במידע נוסף?', timestamp: '2023-03-16T09:15:45Z' },
        { id: 3, role: 'user', content: 'כן, האם יש משלוח חינם?', timestamp: '2023-03-16T09:16:10Z' },
        { id: 4, role: 'assistant', content: 'משלוח חינם ניתן בהזמנות מעל 300 ש"ח. אחרת, עלות המשלוח היא 30 ש"ח.', timestamp: '2023-03-16T09:16:30Z' },
        { id: 5, role: 'user', content: 'כמה זמן לוקח המשלוח?', timestamp: '2023-03-16T09:17:00Z' },
        { id: 6, role: 'assistant', content: 'זמן המשלוח הוא בין 3-5 ימי עסקים.', timestamp: '2023-03-16T09:17:20Z' },
        { id: 7, role: 'user', content: 'תודה רבה!', timestamp: '2023-03-16T09:25:30Z' },
        { id: 8, role: 'assistant', content: 'בשמחה! אם יש לך שאלות נוספות, אשמח לעזור.', timestamp: '2023-03-16T09:25:45Z' }
      ]
    };
    
    return mockConversation;
  }
  
  try {
    const response = await api.get(`/conversations/${conversationId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'שגיאה בקבלת פרטי שיחה' };
  }
};

// API סטטיסטיקות

/**
 * קבלת סטטיסטיקות כלליות
 * @param {Object} params פרמטרים לסינון
 * @returns {Promise} תוצאת הבקשה
 */
export const getStats = async (params = {}) => {
  // במצב פיתוח, החזר נתונים מדומים
  if (DEV_MODE) {
    logger.info('DEV MODE: Returning mock general statistics');
    
    // יצירת נתונים מדומים לסטטיסטיקות כלליות
    const mockStats = {
      totalAgents: mockData.agents.length,
      activeAgents: mockData.agents.filter(agent => agent.status === 'פעיל').length,
      totalConversations: mockData.agents.reduce((sum, agent) => sum + (agent.conversationsCount || 0), 0),
      dailyConversations: [
        { date: '2023-03-10', count: 120 },
        { date: '2023-03-11', count: 145 },
        { date: '2023-03-12', count: 135 },
        { date: '2023-03-13', count: 160 },
        { date: '2023-03-14', count: 155 },
        { date: '2023-03-15', count: 180 },
        { date: '2023-03-16', count: 165 }
      ],
      averageResponseTime: 1.5, // בשניות
      conversionRate: 0.15 // 15%
    };
    
    return mockStats;
  }
  
  try {
    const response = await api.get('/stats', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'שגיאה בקבלת סטטיסטיקות' };
  }
};

/**
 * קבלת סטטיסטיקות של סוכן
 * @param {string|number} agentId מזהה הסוכן
 * @param {Object} params פרמטרים לסינון
 * @returns {Promise} תוצאת הבקשה
 */
export const getAgentStats = async (agentId, params = {}) => {
  // במצב פיתוח, החזר נתונים מדומים
  if (DEV_MODE) {
    logger.info(`DEV MODE: Returning mock statistics for agent ID: ${agentId}`);
    
    // חיפוש הסוכן בנתונים הקיימים
    const agent = mockData.agents.find(a => a.id === parseInt(agentId));
    if (!agent) {
      throw { message: 'סוכן לא נמצא' };
    }
    
    // יצירת נתונים מדומים לסטטיסטיקות
    const mockStats = {
      totalConversations: agent.conversationsCount || 0,
      dailyConversations: [
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
  
  try {
    const response = await api.get(`/agents/${agentId}/stats`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'שגיאה בקבלת סטטיסטיקות סוכן' };
  }
};

// נתונים מדומים למאגרי ידע
const mockKnowledgeBases = [
  {
    id: 1,
    name: 'מאגר מוצרים',
    description: 'מידע על מוצרים, מחירים ומפרטים טכניים',
    type: 'קבצים',
    fileCount: 5,
    lastUpdated: '2023-03-10T14:30:00Z',
    createdAt: '2023-01-20T10:15:00Z'
  },
  {
    id: 2,
    name: 'שאלות נפוצות',
    description: 'תשובות לשאלות נפוצות של לקוחות',
    type: 'טקסט',
    entryCount: 25,
    lastUpdated: '2023-03-12T09:45:00Z',
    createdAt: '2023-02-05T11:30:00Z'
  },
  {
    id: 3,
    name: 'מדיניות החברה',
    description: 'מדיניות משלוחים, החזרות ותנאי שימוש',
    type: 'קבצים',
    fileCount: 3,
    lastUpdated: '2023-02-28T16:20:00Z',
    createdAt: '2023-02-15T13:10:00Z'
  }
];

// API מאגרי ידע

/**
 * קבלת רשימת מאגרי ידע
 * @returns {Promise} תוצאת הבקשה
 */
export const getKnowledgeBases = async () => {
  // במצב פיתוח, החזר נתונים מדומים
  if (DEV_MODE) {
    logger.info('DEV MODE: Returning mock knowledge bases');
    return mockKnowledgeBases;
  }
  
  try {
    const response = await api.get('/knowledge-bases');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'שגיאה בקבלת רשימת מאגרי ידע' };
  }
};

/**
 * קבלת פרטי מאגר ידע לפי מזהה
 * @param {string|number} id מזהה מאגר הידע
 * @returns {Promise} תוצאת הבקשה
 */
export const getKnowledgeBaseById = async (id) => {
  // במצב פיתוח, החזר נתונים מדומים
  if (DEV_MODE) {
    logger.info(`DEV MODE: Returning mock knowledge base for ID: ${id}`);
    const kb = mockKnowledgeBases.find(kb => kb.id === parseInt(id));
    if (!kb) {
      throw { message: 'מאגר ידע לא נמצא' };
    }
    
    // הוספת נתונים נוספים למאגר ידע ספציפי
    const kbDetails = {
      ...kb,
      entries: kb.type === 'טקסט' ? [
        { id: 1, title: 'איך לבצע הזמנה?', content: 'כדי לבצע הזמנה, יש להיכנס לאתר, לבחור את המוצרים הרצויים ולהוסיף אותם לסל הקניות...' },
        { id: 2, title: 'מהם זמני האספקה?', content: 'זמני האספקה הם בין 3-5 ימי עסקים. בהזמנות מעל 300 ש"ח המשלוח חינם...' },
        { id: 3, title: 'מה מדיניות ההחזרות?', content: 'ניתן להחזיר מוצרים תוך 14 יום מיום קבלת ההזמנה, כל עוד המוצר בשלמותו ובאריזתו המקורית...' }
      ] : [
        { id: 1, name: 'קטלוג מוצרים.pdf', size: '2.5MB', uploadedAt: '2023-01-20T10:20:00Z' },
        { id: 2, name: 'מפרטים טכניים.docx', size: '1.8MB', uploadedAt: '2023-02-15T14:30:00Z' },
        { id: 3, name: 'מחירון.xlsx', size: '950KB', uploadedAt: '2023-03-10T14:30:00Z' }
      ]
    };
    
    return kbDetails;
  }
  
  try {
    const response = await api.get(`/knowledge-bases/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'שגיאה בקבלת פרטי מאגר ידע' };
  }
};

/**
 * יצירת מאגר ידע חדש
 * @param {Object} data פרטי מאגר הידע
 * @returns {Promise} תוצאת הבקשה
 */
export const createKnowledgeBase = async (data) => {
  // במצב פיתוח, החזר נתונים מדומים
  if (DEV_MODE) {
    logger.info('DEV MODE: Creating mock knowledge base', data);
    
    const newKB = {
      id: mockKnowledgeBases.length > 0 ? Math.max(...mockKnowledgeBases.map(kb => kb.id)) + 1 : 1,
      ...data,
      fileCount: data.type === 'קבצים' ? 0 : undefined,
      entryCount: data.type === 'טקסט' ? 0 : undefined,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    mockKnowledgeBases.push(newKB);
    return newKB;
  }
  
  try {
    const response = await api.post('/knowledge-bases', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'שגיאה ביצירת מאגר ידע' };
  }
};

/**
 * עדכון פרטי מאגר ידע
 * @param {string|number} id מזהה מאגר הידע
 * @param {Object} data פרטי מאגר הידע לעדכון
 * @returns {Promise} תוצאת הבקשה
 */
export const updateKnowledgeBase = async (id, data) => {
  // במצב פיתוח, החזר נתונים מדומים
  if (DEV_MODE) {
    logger.info(`DEV MODE: Updating mock knowledge base with ID: ${id}`, data);
    
    const index = mockKnowledgeBases.findIndex(kb => kb.id === parseInt(id));
    if (index === -1) {
      throw { message: 'מאגר ידע לא נמצא' };
    }
    
    const updatedKB = {
      ...mockKnowledgeBases[index],
      ...data,
      lastUpdated: new Date().toISOString()
    };
    
    mockKnowledgeBases[index] = updatedKB;
    return updatedKB;
  }
  
  try {
    const response = await api.put(`/knowledge-bases/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'שגיאה בעדכון פרטי מאגר ידע' };
  }
};

/**
 * מחיקת מאגר ידע
 * @param {string|number} id מזהה מאגר הידע
 * @returns {Promise} תוצאת הבקשה
 */
export const deleteKnowledgeBase = async (id) => {
  // במצב פיתוח, החזר נתונים מדומים
  if (DEV_MODE) {
    logger.info(`DEV MODE: Deleting mock knowledge base with ID: ${id}`);
    
    const index = mockKnowledgeBases.findIndex(kb => kb.id === parseInt(id));
    if (index === -1) {
      throw { message: 'מאגר ידע לא נמצא' };
    }
    
    mockKnowledgeBases.splice(index, 1);
    return { success: true };
  }
  
  try {
    const response = await api.delete(`/knowledge-bases/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'שגיאה במחיקת מאגר ידע' };
  }
};

// API תחזוקה

/**
 * ריקון מטמון
 * @returns {Promise} תוצאת הבקשה
 */
export const clearCache = async () => {
  // במצב פיתוח, החזר נתונים מדומים
  if (DEV_MODE) {
    logger.info('DEV MODE: Simulating cache clearing');
    return { success: true, message: 'המטמון רוקן בהצלחה', clearedEntries: 24 };
  }
  
  try {
    const response = await api.post('/maintenance/clear-cache');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'שגיאה בריקון מטמון' };
  }
};

// ייצוא מופע ה-API
export default api;
