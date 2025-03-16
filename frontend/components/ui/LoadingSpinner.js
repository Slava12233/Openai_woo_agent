'use client';

import { FaSpinner } from 'react-icons/fa';

const sizes = {
  small: 'w-4 h-4',
  medium: 'w-8 h-8',
  large: 'w-12 h-12'
};

export default function LoadingSpinner({ size = 'medium', className = '' }) {
  const sizeClass = sizes[size] || sizes.medium;
  
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <FaSpinner className={`${sizeClass} text-primary animate-spin`} />
      <span className="sr-only">טוען...</span>
    </div>
  );
} 