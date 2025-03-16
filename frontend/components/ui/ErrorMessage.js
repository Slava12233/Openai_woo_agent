'use client';

import { FaExclamationTriangle } from 'react-icons/fa';

export default function ErrorMessage({ message, className = '' }) {
  return (
    <div className={`bg-red-100 border border-red-200 text-red-700 p-4 rounded-lg ${className}`}>
      <div className="flex items-center">
        <FaExclamationTriangle className="text-red-500 mr-2" />
        <span className="font-medium">שגיאה:</span>
      </div>
      <p className="mt-2">{message}</p>
    </div>
  );
} 