'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const variants = {
  primary: 'bg-gradient-blue text-white hover:shadow-lg',
  secondary: 'bg-gradient-green text-white hover:shadow-lg',
  outline: 'bg-transparent border border-accent-primary text-accent-primary hover:bg-accent-primary hover:bg-opacity-10',
  ghost: 'bg-transparent text-accent-primary hover:bg-accent-primary hover:bg-opacity-10',
  danger: 'bg-accent-danger text-white hover:shadow-lg',
};

const sizes = {
  sm: 'py-1 px-3 text-sm',
  md: 'py-2 px-4 text-base',
  lg: 'py-3 px-6 text-lg',
};

export default function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  icon = null,
  onClick,
  type = 'button',
  ...props
}) {
  const baseClasses = 'relative inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const buttonClasses = twMerge(
    clsx(
      baseClasses,
      variants[variant],
      sizes[size],
      className
    )
  );

  const buttonVariants = {
    initial: { scale: 1 },
    tap: { scale: 0.98 },
    hover: { 
      y: -3,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    }
  };

  return (
    <motion.button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || isLoading}
      initial="initial"
      whileTap="tap"
      whileHover="hover"
      variants={buttonVariants}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      {...props}
    >
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      )}
      
      <span className={`flex items-center ${isLoading ? 'opacity-0' : ''}`}>
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </span>
    </motion.button>
  );
} 