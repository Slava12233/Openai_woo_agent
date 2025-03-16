'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  
  // בדיקה אם המשתמש גלל למטה כדי להוסיף אפקט לתפריט העליון
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // סגירת תפריט המשתמש בלחיצה מחוץ לתפריט
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.user-menu')) {
        setUserMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);
  
  // רק להציג את הניווט בדפים הרלוונטיים
  if (!pathname.includes('/dashboard') && !pathname.includes('/create-agent') && 
      !pathname.includes('/edit-agent') && !pathname.includes('/settings') && 
      !pathname.includes('/help') && !pathname.includes('/agent')) {
    return null;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <>
      {/* תפריט צד */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-64 bg-blue-950 text-white shadow-md transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-blue-900">
            <div className="flex items-center justify-between">
              <button 
                onClick={toggleSidebar}
                className="md:hidden text-white hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md ml-2">
                  <span className="text-xl font-bold text-blue-950">W</span>
                </div>
                <span className="text-xl font-bold text-white">
                  WooManager
                </span>
              </div>
            </div>
          </div>
          
          {/* פרטי המשתמש */}
          {user && (
            <div className="p-4 border-b border-blue-900">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center text-white font-bold ml-3">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.name || 'משתמש'}
                  </p>
                  <p className="text-xs text-blue-200 truncate">
                    {user.email || 'user@example.com'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
            <Link
              href="/dashboard"
              className={`flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-200 ${
                pathname === '/dashboard'
                  ? 'bg-blue-800 text-white font-medium'
                  : 'text-blue-100 hover:bg-blue-900 hover:text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span>לוח בקרה</span>
            </Link>
            
            <Link
              href="/create-agent"
              className={`flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-200 ${
                pathname.includes('/create-agent')
                  ? 'bg-blue-800 text-white font-medium'
                  : 'text-blue-100 hover:bg-blue-900 hover:text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>יצירת סוכן חדש</span>
            </Link>
            
            <Link
              href="/settings"
              className={`flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-200 ${
                pathname.includes('/settings')
                  ? 'bg-blue-800 text-white font-medium'
                  : 'text-blue-100 hover:bg-blue-900 hover:text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <span>הגדרות</span>
            </Link>
            
            <Link
              href="/help"
              className={`flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-200 ${
                pathname.includes('/help')
                  ? 'bg-blue-800 text-white font-medium'
                  : 'text-blue-100 hover:bg-blue-900 hover:text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span>עזרה ותמיכה</span>
            </Link>
          </nav>
          
          <div className="p-4 border-t border-blue-900">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-blue-950 bg-white rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              <span>התנתק</span>
            </button>
          </div>
        </div>
      </aside>
      
      {/* תפריט עליון למובייל */}
      <nav className={`fixed top-0 left-0 right-0 z-40 md:hidden transition-all duration-300 ${
        scrolled 
          ? 'bg-blue-950 shadow-md' 
          : 'bg-blue-950 shadow-sm border-b border-blue-900'
      }`}>
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md ml-2">
              <span className="text-lg font-bold text-blue-950">W</span>
            </div>
            <span className="text-xl font-bold text-white">
              WooManager
            </span>
          </div>
          
          <div className="flex items-center">
            {/* תפריט משתמש במובייל */}
            {user && (
              <div className="relative user-menu mr-2">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center focus:outline-none"
                >
                  <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center text-white font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </button>
                
                {userMenuOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user.name || 'משתמש'}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email || 'user@example.com'}</p>
                    </div>
                    <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      הגדרות
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      התנתק
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-md text-white hover:bg-blue-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
      
      {/* כיסוי רקע כשהתפריט פתוח במובייל */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      
      {/* מרווח עבור התוכן הראשי */}
      <div className="md:mr-64"></div>
    </>
  );
}
