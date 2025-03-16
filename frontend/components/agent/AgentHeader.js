'use client';

import { useState } from 'react';
import { useAgents } from '../../context/AgentContext';
import { FaRobot, FaStore, FaToggleOn, FaToggleOff, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';

export default function AgentHeader({ agent }) {
  const { editAgent } = useAgents();
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const toggleAgentStatus = async () => {
    try {
      setUpdatingStatus(true);
      const newStatus = agent.status === 'פעיל' ? 'לא פעיל' : 'פעיל';
      await editAgent(agent.id, { status: newStatus });
    } catch (error) {
      console.error('שגיאה בשינוי סטטוס הסוכן:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <Link href="/dashboard" className="flex items-center text-black hover:text-gray-700 transition-colors">
          <FaArrowRight className="ml-2" />
          <span>חזרה לדאשבורד</span>
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center ml-4">
            <FaRobot className="w-8 h-8 text-gray-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{agent.name}</h1>
            <div className="flex items-center mt-1">
              <FaStore className="w-4 h-4 text-gray-500 ml-2" />
              <a href={agent.storeUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline">
                {agent.storeUrl}
              </a>
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="ml-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${agent.status === 'פעיל' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {agent.status}
            </span>
          </div>
          
          <button
            onClick={toggleAgentStatus}
            disabled={updatingStatus}
            className={`flex items-center px-4 py-2 rounded-lg ${agent.status === 'פעיל' ? 'bg-red-100 text-red-800 hover:bg-red-200' : 'bg-green-100 text-green-800 hover:bg-green-200'} transition-colors duration-200`}
          >
            {updatingStatus ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin ml-2"></div>
            ) : agent.status === 'פעיל' ? (
              <FaToggleOff className="w-5 h-5 ml-2" />
            ) : (
              <FaToggleOn className="w-5 h-5 ml-2" />
            )}
            {agent.status === 'פעיל' ? 'כבה סוכן' : 'הפעל סוכן'}
          </button>
        </div>
      </div>
    </div>
  );
} 