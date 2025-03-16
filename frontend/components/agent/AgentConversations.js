'use client';

import { useState, useEffect } from 'react';
import { FaUser, FaRobot, FaSearch, FaCalendarAlt, FaEye, FaDownload, FaTrash } from 'react-icons/fa';
import { useAgents } from '../../context/AgentContext';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function AgentConversations({ agent }) {
  const { fetchAgentConversations } = useAgents();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const data = await fetchAgentConversations(agent.id);
        
        if (data && data.conversations) {
          const currentIds = conversations.map(c => c.id).sort().join(',');
          const newIds = data.conversations.map(c => c.id).sort().join(',');
          
          if (currentIds !== newIds || conversations.length === 0) {
            setConversations(data.conversations);
          }
        } else if (data && Array.isArray(data) && data.length > 0) {
          const currentIds = conversations.map(c => c.id).sort().join(',');
          const newIds = data.map(c => c.id).sort().join(',');
          
          if (currentIds !== newIds || conversations.length === 0) {
            setConversations(data);
          }
        } else if (conversations.length === 0) {
          setConversations([]);
        }
      } catch (error) {
        console.error('שגיאה בטעינת השיחות:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [agent.id]);

  const filteredConversations = conversations.filter(conversation => {
    if (!conversation) return false;
    
    const searchMatch = 
      ((conversation.userName || '').toLowerCase().includes(searchTerm.toLowerCase())) ||
      ((conversation.summary || '').toLowerCase().includes(searchTerm.toLowerCase())) ||
      ((conversation.status || '').toLowerCase().includes(searchTerm.toLowerCase()));
    
    let dateMatch = true;
    
    if (dateFilter !== 'all' && conversation.startTime) {
      const today = new Date();
      const conversationDate = new Date(conversation.startTime || conversation.date);
      
      if (isNaN(conversationDate.getTime())) {
        return false;
      }
      
      if (dateFilter === 'today') {
        dateMatch = conversationDate.toDateString() === today.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateMatch = conversationDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        dateMatch = conversationDate >= monthAgo;
      }
    }
    
    return searchMatch && dateMatch;
  });

  const loadConversationMessages = async (conversationId) => {
    if (selectedConversation === conversationId && conversationMessages.length > 0) {
      return;
    }
    
    try {
      setLoadingMessages(true);
      setSelectedConversation(conversationId);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const conversation = conversations.find(conv => conv.id === conversationId);
      if (!conversation) return;
      
      const mockMessages = generateMockMessages(conversation);
      setConversationMessages(mockMessages);
    } catch (error) {
      console.error('שגיאה בטעינת הודעות:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const generateMockMessages = (conversation) => {
    try {
      const messages = [];
      const messageCount = conversation.messageCount || 5;
      const userName = conversation.userName || 'משתמש';
      const summary = conversation.summary || conversation.topic || 'מוצרים';
      const topic = summary.toLowerCase();
      const startTime = conversation.startTime || conversation.date || new Date();
      
      let conversationDate = new Date(startTime);
      if (isNaN(conversationDate.getTime())) {
        conversationDate = new Date();
      }
      
      messages.push({
        id: `msg-${conversation.id}-0`,
        sender: 'user',
        senderName: userName,
        content: `שלום, יש לי שאלה בנוגע ל${topic}`,
        timestamp: conversationDate
      });
      
      const botFirstReply = new Date(conversationDate);
      botFirstReply.setMinutes(botFirstReply.getMinutes() + 1);
      messages.push({
        id: `msg-${conversation.id}-1`,
        sender: 'agent',
        senderName: agent.name || 'סוכן',
        content: `שלום ${userName}! אשמח לעזור לך בנושא ${topic}. במה אוכל לסייע?`,
        timestamp: botFirstReply
      });
      
      const possibleUserMessages = [
        `האם יש לכם ${topic} במלאי?`,
        `מה המחיר של ${topic}?`,
        `מתי אוכל לקבל את ה${topic}?`,
        `האם אפשר לקבל פרטים נוספים על ${topic}?`,
        `תודה על העזרה!`
      ];
      
      const possibleAgentMessages = [
        `בוודאי, אבדוק עבורך את המידע על ${topic}.`,
        `לפי המידע שיש לי, ${topic} זמין במלאי.`,
        `המחיר של ${topic} הוא 199.90 ש"ח.`,
        `זמן האספקה המשוער הוא 3-5 ימי עסקים.`,
        `אשמח לעזור בכל שאלה נוספת!`
      ];
      
      const maxMessages = Math.min(messageCount, 20);
      
      for (let i = 2; i < maxMessages; i++) {
        const prevTimestamp = messages[i-1].timestamp;
        const newTimestamp = new Date(prevTimestamp);
        newTimestamp.setMinutes(newTimestamp.getMinutes() + Math.floor(Math.random() * 10) + 1);
        
        if (i % 2 === 0) {
          messages.push({
            id: `msg-${conversation.id}-${i}`,
            sender: 'user',
            senderName: userName,
            content: possibleUserMessages[Math.floor(Math.random() * possibleUserMessages.length)],
            timestamp: newTimestamp
          });
        } else {
          messages.push({
            id: `msg-${conversation.id}-${i}`,
            sender: 'agent',
            senderName: agent.name || 'סוכן',
            content: possibleAgentMessages[Math.floor(Math.random() * possibleAgentMessages.length)],
            timestamp: newTimestamp
          });
        }
      }
      
      return messages;
    } catch (error) {
      console.error('שגיאה ביצירת הודעות מדומות:', error);
      return [];
    }
  };

  const formatDate = (date) => {
    try {
      if (!date || isNaN(date.getTime())) {
        return 'תאריך לא ידוע';
      }
      
      return new Intl.DateTimeFormat('he-IL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('שגיאה בפורמט תאריך:', error);
      return 'תאריך לא ידוע';
    }
  };

  const exportConversation = () => {
    try {
      if (!selectedConversation || conversationMessages.length === 0) return;
      
      const conversation = conversations.find(conv => conv.id === selectedConversation);
      if (!conversation) return;
      
      const exportData = {
        conversation: {
          id: conversation.id,
          userName: conversation.userName || 'משתמש לא ידוע',
          summary: conversation.summary || conversation.topic || 'שיחה',
          startTime: conversation.startTime || conversation.date || new Date().toISOString(),
          endTime: conversation.endTime,
          status: conversation.status || 'לא ידוע',
          messageCount: conversation.messageCount || conversationMessages.length
        },
        messages: conversationMessages.map(msg => ({
          sender: msg.sender,
          senderName: msg.senderName,
          content: msg.content,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
        }))
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileName = `conversation-${conversation.id}-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileName);
      linkElement.click();
    } catch (error) {
      console.error('שגיאה בייצוא השיחה:', error);
      alert('אירעה שגיאה בייצוא השיחה. נסה שוב מאוחר יותר.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full p-2 pr-10 text-gray-900 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            placeholder="חיפוש לפי שם, נושא או תוכן..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading || conversations.length === 0}
          />
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <FaCalendarAlt className="text-gray-400" />
          </div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="block p-2 pr-10 text-gray-900 border border-gray-300 rounded-md focus:ring-primary focus:border-primary appearance-none"
            disabled={loading || conversations.length === 0}
          >
            <option value="all">כל התאריכים</option>
            <option value="today">היום</option>
            <option value="week">שבוע אחרון</option>
            <option value="month">חודש אחרון</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-12">
          <LoadingSpinner />
          <span className="mr-2">טוען שיחות...</span>
        </div>
      ) : !Array.isArray(conversations) || conversations.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <FaSearch className="mx-auto text-gray-400 text-4xl mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">לא נמצאו שיחות</h3>
          <p className="text-gray-500">לא נמצאו שיחות עבור סוכן זה.</p>
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <FaSearch className="mx-auto text-gray-400 text-4xl mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">לא נמצאו שיחות</h3>
          <p className="text-gray-500">נסה לשנות את מונחי החיפוש או את סינון התאריכים.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold">שיחות ({filteredConversations.length})</h3>
            </div>
            <div className="overflow-y-auto max-h-[600px]">
              <ul className="divide-y divide-gray-200">
                {filteredConversations.map((conversation) => (
                  <li 
                    key={conversation.id}
                    className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation === conversation.id ? 'bg-blue-50 border-r-4 border-primary' : ''
                    }`}
                    onClick={() => loadConversationMessages(conversation.id)}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium">{conversation.userName || 'משתמש לא ידוע'}</h4>
                        <span className="text-xs text-gray-500">
                          {formatDate(new Date(conversation.startTime || conversation.date))}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{conversation.summary || conversation.topic || 'שיחה'}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">{conversation.messageCount || 0} הודעות</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          conversation.status === 'פעיל' || conversation.status === 'active'
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {conversation.status || 'לא ידוע'}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">
                      {conversations.find(c => c.id === selectedConversation)?.summary || 
                       conversations.find(c => c.id === selectedConversation)?.topic || 
                       'פרטי שיחה'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      שיחה עם {conversations.find(c => c.id === selectedConversation)?.userName || 'משתמש לא ידוע'}
                    </p>
                  </div>
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <button
                      onClick={exportConversation}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                      title="ייצא שיחה"
                    >
                      <FaDownload />
                    </button>
                    <button
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                      title="מחק שיחה"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                
                <div className="p-4 overflow-y-auto h-[500px] bg-gray-50">
                  {loadingMessages ? (
                    <div className="flex justify-center items-center h-full">
                      <LoadingSpinner />
                      <span className="mr-2">טוען הודעות...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {conversationMessages.map((message) => (
                        <div 
                          key={message.id}
                          className={`flex ${message.sender === 'user' ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className={`max-w-[80%] rounded-lg p-3 ${
                            message.sender === 'user' 
                              ? 'bg-white border border-gray-200' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            <div className="flex items-center mb-1">
                              {message.sender === 'user' ? (
                                <FaUser className="text-gray-500 ml-2" />
                              ) : (
                                <FaRobot className="text-blue-600 ml-2" />
                              )}
                              <span className="font-medium text-sm">
                                {message.senderName}
                              </span>
                              <span className="text-xs text-gray-500 mr-2">
                                {formatDate(message.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[600px] text-center p-8">
                <FaEye className="text-gray-300 text-5xl mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">בחר שיחה לצפייה</h3>
                <p className="text-gray-500 max-w-md">
                  בחר שיחה מהרשימה משמאל כדי לצפות בתוכן השיחה ולנהל אותה.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 