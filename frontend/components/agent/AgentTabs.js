'use client';

import { FaHome, FaBook, FaComments, FaDatabase, FaCog, FaList } from 'react-icons/fa';

export default function AgentTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'overview', label: 'סקירה כללית', icon: <FaHome /> },
    { id: 'training', label: 'אימון', icon: <FaBook /> },
    { id: 'conversations', label: 'שיחות', icon: <FaComments /> },
    { id: 'knowledge', label: 'מאגר ידע', icon: <FaDatabase /> },
    { id: 'settings', label: 'הגדרות מתקדמות', icon: <FaCog /> },
    { id: 'logs', label: 'לוגים', icon: <FaList /> },
  ];

  return (
    <div className="border-b border-gray-200">
      <div className="flex overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap
              border-b-2 transition-colors duration-200
              ${activeTab === tab.id
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <span className="ml-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
} 