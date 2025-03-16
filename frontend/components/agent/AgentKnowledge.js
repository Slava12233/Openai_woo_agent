'use client';

import { useState, useRef } from 'react';
import { FaDatabase, FaFileUpload, FaTrash, FaPlus, FaLink, FaGlobe, FaFileAlt, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { useAgents } from '../../context/AgentContext';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function AgentKnowledge({ agent }) {
  const { editAgent, loading } = useAgents();
  const [knowledgeSources, setKnowledgeSources] = useState(agent.knowledgeSources || []);
  const [newSource, setNewSource] = useState({ type: 'url', content: '', name: '' });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleAddSource = async () => {
    try {
      setError('');
      setSuccess('');
      
      // ולידציה בסיסית
      if (!newSource.content.trim()) {
        setError('יש להזין תוכן למקור הידע');
        return;
      }
      
      if (newSource.type === 'url' && !isValidUrl(newSource.content)) {
        setError('יש להזין כתובת URL תקינה');
        return;
      }
      
      if (!newSource.name.trim()) {
        // אם לא הוזן שם, ניצור שם אוטומטי
        if (newSource.type === 'url') {
          try {
            const url = new URL(newSource.content);
            newSource.name = url.hostname;
          } catch {
            newSource.name = 'קישור חדש';
          }
        } else if (newSource.type === 'text') {
          newSource.name = 'מסמך טקסט חדש';
        }
      }
      
      const newSourceItem = {
        id: Date.now().toString(),
        type: newSource.type,
        content: newSource.content,
        name: newSource.name,
        addedAt: new Date().toISOString()
      };
      
      const updatedSources = [...knowledgeSources, newSourceItem];
      setKnowledgeSources(updatedSources);
      
      // עדכון בשרת
      await editAgent(agent.id, { knowledgeSources: updatedSources });
      
      // איפוס הטופס
      setNewSource({ type: 'url', content: '', name: '' });
      setSuccess('מקור הידע נוסף בהצלחה');
      
      // מסתיר את הודעת ההצלחה אחרי 3 שניות
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('שגיאה בהוספת מקור ידע:', err);
      setError('אירעה שגיאה בהוספת מקור הידע');
    }
  };

  const handleRemoveSource = async (sourceId) => {
    try {
      setError('');
      
      if (window.confirm('האם אתה בטוח שברצונך למחוק מקור ידע זה?')) {
        const updatedSources = knowledgeSources.filter(source => source.id !== sourceId);
        setKnowledgeSources(updatedSources);
        
        // עדכון בשרת
        await editAgent(agent.id, { knowledgeSources: updatedSources });
        
        setSuccess('מקור הידע נמחק בהצלחה');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('שגיאה במחיקת מקור ידע:', err);
      setError('אירעה שגיאה במחיקת מקור הידע');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setUploadingFile(true);
      setError('');
      
      // בדיקת סוג הקובץ
      const allowedTypes = ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('סוג הקובץ אינו נתמך. יש להעלות קובץ מסוג TXT, PDF או DOCX');
        setUploadingFile(false);
        return;
      }
      
      // בדיקת גודל הקובץ (מקסימום 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('גודל הקובץ חורג מהמותר (מקסימום 5MB)');
        setUploadingFile(false);
        return;
      }
      
      // במימוש אמיתי, כאן תהיה העלאת הקובץ לשרת
      // לצורך הדוגמה, נדמה העלאה מוצלחת
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newSourceItem = {
        id: Date.now().toString(),
        type: 'file',
        content: URL.createObjectURL(file), // במימוש אמיתי, כאן יהיה ה-URL שהשרת מחזיר
        name: file.name,
        fileType: file.type,
        fileSize: file.size,
        addedAt: new Date().toISOString()
      };
      
      const updatedSources = [...knowledgeSources, newSourceItem];
      setKnowledgeSources(updatedSources);
      
      // עדכון בשרת
      await editAgent(agent.id, { knowledgeSources: updatedSources });
      
      setSuccess('הקובץ הועלה בהצלחה');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('שגיאה בהעלאת קובץ:', err);
      setError('אירעה שגיאה בהעלאת הקובץ');
    } finally {
      setUploadingFile(false);
      // איפוס שדה הקובץ
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // פונקציה לבדיקת תקינות URL
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // פונקציה לפורמט גודל קובץ
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // פונקציה לקבלת אייקון לפי סוג מקור
  const getSourceIcon = (source) => {
    switch (source.type) {
      case 'url':
        return <FaGlobe className="text-blue-500" />;
      case 'text':
        return <FaFileAlt className="text-green-500" />;
      case 'file':
        return <FaFileAlt className="text-orange-500" />;
      default:
        return <FaDatabase className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <FaDatabase className="ml-2 text-primary" />
          מאגר הידע של הסוכן
        </h3>
        <p className="text-gray-600 mb-6">
          הוסף מקורות ידע שהסוכן ישתמש בהם כדי לענות על שאלות. ניתן להוסיף קישורים, קבצים או טקסט ישירות.
        </p>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4 flex items-start">
            <FaExclamationTriangle className="text-red-500 mt-1 ml-2 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4 flex items-start">
            <FaCheck className="text-green-500 mt-1 ml-2 flex-shrink-0" />
            <p className="text-green-700">{success}</p>
          </div>
        )}
        
        {/* טופס הוספת מקור ידע */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium mb-4">הוסף מקור ידע חדש</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">סוג מקור</label>
              <select
                value={newSource.type}
                onChange={(e) => setNewSource({ ...newSource, type: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="url">קישור (URL)</option>
                <option value="text">טקסט</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {newSource.type === 'url' ? 'כתובת URL' : 'תוכן'}
              </label>
              {newSource.type === 'url' ? (
                <input
                  type="url"
                  value={newSource.content}
                  onChange={(e) => setNewSource({ ...newSource, content: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                />
              ) : (
                <textarea
                  value={newSource.content}
                  onChange={(e) => setNewSource({ ...newSource, content: e.target.value })}
                  placeholder="הזן כאן את הטקסט..."
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                />
              )}
            </div>
            
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">שם (אופציונלי)</label>
              <input
                type="text"
                value={newSource.name}
                onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                placeholder="שם לזיהוי מקור הידע"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleAddSource}
              disabled={loading}
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md flex items-center transition-colors"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" className="ml-2" />
                  מוסיף...
                </>
              ) : (
                <>
                  <FaPlus className="ml-2" />
                  הוסף מקור
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* העלאת קובץ */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium mb-4">העלאת קובץ</h4>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".txt,.pdf,.doc,.docx"
              disabled={uploadingFile}
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFile}
              className="flex flex-col items-center justify-center w-full cursor-pointer"
            >
              {uploadingFile ? (
                <>
                  <LoadingSpinner className="mb-3" />
                  <span className="text-gray-700 font-medium">מעלה קובץ...</span>
                </>
              ) : (
                <>
                  <FaFileUpload className="text-gray-400 text-4xl mb-3" />
                  <span className="text-gray-700 font-medium mb-1">לחץ להעלאת קובץ</span>
                  <span className="text-sm text-gray-500">או גרור קובץ לכאן</span>
                  <span className="text-xs text-gray-500 mt-2">קבצים נתמכים: TXT, PDF, DOC, DOCX (עד 5MB)</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* רשימת מקורות ידע */}
        <h4 className="font-medium mb-4">מקורות ידע ({knowledgeSources.length})</h4>
        
        {knowledgeSources.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <FaDatabase className="mx-auto text-gray-400 text-4xl mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">אין מקורות ידע</h3>
            <p className="text-gray-500">הוסף מקורות ידע כדי לשפר את היכולות של הסוכן.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {knowledgeSources.map((source) => (
                <li key={source.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className="mt-1 ml-3">
                        {getSourceIcon(source)}
                      </div>
                      <div>
                        <h5 className="font-medium">{source.name}</h5>
                        <p className="text-sm text-gray-600 mb-1 break-all">
                          {source.type === 'url' ? (
                            <a href={source.content} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                              <FaLink className="ml-1" />
                              {source.content}
                            </a>
                          ) : source.type === 'file' ? (
                            <span className="flex items-center">
                              {source.fileType?.split('/')[1]?.toUpperCase() || 'FILE'} • {formatFileSize(source.fileSize || 0)}
                            </span>
                          ) : (
                            <span className="line-clamp-2">{source.content}</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          נוסף בתאריך: {new Date(source.addedAt).toLocaleDateString('he-IL')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveSource(source.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="מחק מקור"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 