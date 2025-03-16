'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const variants = {
  default: 'bg-white border border-gray-300',
  glass: 'bg-white border border-gray-300 shadow-md',
  gradient: 'bg-white',
  outline: 'bg-white border border-gray-400',
};

export function Card({
  children,
  className,
  variant = 'default',
  hover = true,
  animate = true,
  ...props
}) {
  const baseClasses = 'rounded-md shadow-none p-6';
  
  const cardClasses = twMerge(
    clsx(
      baseClasses,
      variants[variant],
      className
    )
  );

  if (!animate) {
    return (
      <div className={cardClasses} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={cardClasses}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { 
        y: -5, 
        boxShadow: '0 10px 15px -5px rgba(0, 0, 0, 0.1), 0 5px 5px -5px rgba(0, 0, 0, 0.05)',
        transition: { type: 'spring', stiffness: 500, damping: 30 }
      } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default Card;

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={twMerge(clsx('mb-4', className))} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3 className={twMerge(clsx('text-xl font-bold text-black', className))} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className, ...props }) {
  return (
    <p className={twMerge(clsx('text-sm text-gray-600', className))} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={twMerge(clsx('', className))} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div className={twMerge(clsx('mt-4 flex items-center justify-between', className))} {...props}>
      {children}
    </div>
  );
}

export function CardStat({ 
  title, 
  value, 
  icon, 
  trend = null, 
  trendValue = null, 
  className = '',
  textClassName = '',
  ...props 
}) {
  return (
    <div 
      className={`bg-white border border-gray-300 rounded-md shadow-none p-6 ${className}`}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className={`text-gray-800 ${textClassName}`}>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
          
          {trend && (
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                </svg>
              )}
              <span className={`text-xs font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="bg-gray-100 p-3 rounded-md">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
} 