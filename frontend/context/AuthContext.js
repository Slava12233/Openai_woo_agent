'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login as apiLogin, getCurrentUser, logout as apiLogout } from '../utils/api';

// יצירת קונטקסט האימות
const AuthContext = createContext({});

// פרובידר האימות
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // בדיקה אם המשתמש מחובר בטעינת הדף - גרסת פיתוח
  useEffect(() => {
    // במצב פיתוח - לא מתחברים אוטומטית
    setLoading(false);
  }, []);

  // פונקציית התחברות - גרסת פיתוח
  const login = async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      // בשלב הפיתוח - מאפשר התחברות עם כל פרטים
      // במקום לקרוא ל-API, יוצר משתמש מדומה
      const mockUser = {
        id: 1,
        name: 'משתמש פיתוח',
        email: credentials.email || 'dev@example.com',
        role: 'admin'
      };
      
      // שמירת טוקן מדומה
      localStorage.setItem('token', 'dev-token-123456');
      
      // הגדרת המשתמש
      setUser(mockUser);
      
      // מעבר ללוח הבקרה
      router.push('/dashboard');
      
      return { user: mockUser, token: 'dev-token-123456' };
    } catch (error) {
      setError(error.message || 'שגיאה בהתחברות');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // פונקציית יציאה - גרסת פיתוח
  const logout = () => {
    // בשלב הפיתוח - רק מוחקים את הטוקן מהלוקל סטורג'
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
    
    // ניסיון לקרוא ל-API (אם קיים)
    try {
      apiLogout();
    } catch (error) {
      console.log('Logout API not available in development mode');
    }
  };

  // בדיקה אם המשתמש מחובר
  const isAuthenticated = () => {
    return !!user;
  };

  // ערך הקונטקסט
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// הוק לשימוש בקונטקסט האימות
export const useAuth = () => useContext(AuthContext);

// הוק לאבטחת דפים
export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push('/login');
      }
    }, [user, loading, router]);

    // הצגת מסך טעינה כאשר בודקים את האימות
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-lg text-gray-700">טוען...</div>
          </div>
        </div>
      );
    }

    // אם המשתמש מחובר, הצג את הקומפוננטה
    if (user) {
      return <Component {...props} />;
    }

    // אם המשתמש לא מחובר, לא מציגים כלום (יועבר לדף ההתחברות)
    return null;
  };
}
