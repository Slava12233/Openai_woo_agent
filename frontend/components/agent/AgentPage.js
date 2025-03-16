'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAgents } from '../../context/AgentContext';
import AgentHeader from './AgentHeader';
import AgentTabs from './AgentTabs';
import AgentOverview from './AgentOverview';
import AgentTraining from './AgentTraining';
import AgentConversations from './AgentConversations';
import AgentKnowledge from './AgentKnowledge';
import AgentAdvancedSettings from './AgentAdvancedSettings';
import AgentLogs from './AgentLogs';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';

export default function AgentPage({ agentId }) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'overview');
  const { fetchAgentById, currentAgent, loading, error } = useAgents();
  const router = useRouter();
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (agentId && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchAgentById(agentId);
    }
  }, [agentId, fetchAgentById]);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    router.push(`/agent/${agentId}?tab=${tab}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AgentOverview agent={currentAgent} />;
      case 'training':
        return <AgentTraining agent={currentAgent} />;
      case 'conversations':
        return <AgentConversations agent={currentAgent} />;
      case 'knowledge':
        return <AgentKnowledge agent={currentAgent} />;
      case 'settings':
        return <AgentAdvancedSettings agent={currentAgent} />;
      case 'logs':
        return <AgentLogs agent={currentAgent} />;
      default:
        return <AgentOverview agent={currentAgent} />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <ErrorMessage message={error} />
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-4 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
        >
          חזרה לדאשבורד
        </button>
      </div>
    );
  }

  if (!currentAgent) {
    return (
      <div className="container mx-auto p-4">
        <ErrorMessage message="הסוכן לא נמצא" />
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-4 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
        >
          חזרה לדאשבורד
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 rtl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <AgentHeader agent={currentAgent} />
        <AgentTabs activeTab={activeTab} onTabChange={handleTabChange} />
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
} 