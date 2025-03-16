'use client';

import { useState } from 'react';
import { FaBook, FaSave, FaRobot, FaComments, FaExclamationTriangle } from 'react-icons/fa';
import { useAgents } from '../../context/AgentContext';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function AgentTraining({ agent }) {
  const { editAgent, loading } = useAgents();
  const [personality, setPersonality] = useState(agent.personality || '');
  const [welcomeMessage, setWelcomeMessage] = useState(agent.welcomeMessage || '');
  const [instructions, setInstructions] = useState(agent.instructions || '');
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    try {
      setError('');
      setIsSaved(false);
      
      await editAgent(agent.id, {
        personality,
        welcomeMessage,
        instructions
      });
      
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error('שגיאה בעדכון הסוכן:', err);
      setError('אירעה שגיאה בעדכון הסוכן. אנא נסה שנית.');
    }
  };

  // דוגמאות לאישיות הסוכן
  const personalityExamples = [
    {
      title: 'מקצועי ויעיל',
      description: 'סוכן עם גישה עסקית, ממוקד ויעיל שמספק מידע מדויק ותמציתי.',
      example: 'אני סוכן מקצועי ויעיל שמתמקד במתן מענה מדויק ומהיר. אני מעדיף תשובות קצרות וענייניות ומתמקד בעובדות ובמידע מדויק.'
    },
    {
      title: 'ידידותי ומסביר פנים',
      description: 'סוכן חברותי ונגיש שמדבר בגובה העיניים ומעניק חוויית שירות אישית.',
      example: 'אני סוכן ידידותי ונעים שאוהב לעזור ללקוחות. אני משתמש בשפה פשוטה ומובנת, מרבה בביטויי אמפתיה ומתעניין בצרכים האישיים של הלקוח.'
    },
    {
      title: 'מומחה בתחום',
      description: 'סוכן שמציג ידע מעמיק בתחום המוצרים ומספק המלצות מקצועיות.',
      example: 'אני מומחה בתחום המוצרים של החנות ויכול לספק מידע מעמיק על כל פריט. אני מרבה להשתמש במונחים מקצועיים ומספק המלצות מבוססות על מאפייני המוצרים.'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <FaRobot className="ml-2 text-primary" />
          אישיות הסוכן
        </h3>
        <p className="text-gray-600 mb-4">
          הגדר את האישיות והטון של הסוכן שלך. זה ישפיע על האופן שבו הסוכן מתקשר עם הלקוחות.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {personalityExamples.map((example, index) => (
            <div 
              key={index}
              className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-primary hover:bg-blue-50 transition-colors"
              onClick={() => setPersonality(example.example)}
            >
              <h4 className="font-medium mb-2">{example.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{example.description}</p>
              <button className="text-primary text-sm hover:underline">השתמש בתבנית זו</button>
            </div>
          ))}
        </div>
        
        <textarea
          value={personality}
          onChange={(e) => setPersonality(e.target.value)}
          placeholder="תאר את האישיות של הסוכן שלך..."
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
          rows={5}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <FaComments className="ml-2 text-primary" />
          הודעת פתיחה
        </h3>
        <p className="text-gray-600 mb-4">
          הגדר את ההודעה שהסוכן ישלח בתחילת כל שיחה חדשה עם לקוח.
        </p>
        
        <textarea
          value={welcomeMessage}
          onChange={(e) => setWelcomeMessage(e.target.value)}
          placeholder="שלום! אני הסוכן של חנות X. כיצד אוכל לעזור לך היום?"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
          rows={3}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <FaBook className="ml-2 text-primary" />
          הנחיות מתקדמות
        </h3>
        <p className="text-gray-600 mb-4">
          הגדר הנחיות מפורטות לסוכן שיעזרו לו להבין כיצד להתנהג במצבים שונים.
        </p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <div className="flex items-start">
            <FaExclamationTriangle className="text-yellow-500 mt-1 ml-2 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">טיפ למשתמשים מתקדמים</h4>
              <p className="text-sm text-yellow-700">
                הנחיות אלו משפיעות ישירות על התנהגות הסוכן. השתמש בהנחיות מפורטות כדי להגדיר כיצד הסוכן צריך להגיב במצבים ספציפיים, אילו מוצרים להמליץ, וכיצד לטפל בשאלות נפוצות.
              </p>
            </div>
          </div>
        </div>
        
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="הנחיות מפורטות לסוכן..."
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
          rows={8}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-md flex items-center transition-colors"
        >
          {loading ? (
            <>
              <LoadingSpinner size="small" className="ml-2" />
              שומר...
            </>
          ) : (
            <>
              <FaSave className="ml-2" />
              {isSaved ? 'נשמר בהצלחה!' : 'שמור שינויים'}
            </>
          )}
        </button>
      </div>
    </div>
  );
} 