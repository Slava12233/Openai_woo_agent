'use client';

import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Input = forwardRef(({
  className,
  type = 'text',
  error,
  icon,
  dir = 'rtl',
  variant = 'default',
  size = 'md',
  ...props
}, ref) => {
  const variants = {
    default: 'bg-bg-secondary border-bg-secondary focus:border-accent-primary',
    outline: 'bg-transparent border-text-secondary/20 focus:border-accent-primary',
    ghost: 'bg-transparent border-transparent hover:bg-bg-secondary/50 focus:bg-bg-secondary/50',
  };

  const sizes = {
    sm: 'h-8 text-sm px-3',
    md: 'h-10 px-4',
    lg: 'h-12 text-lg px-5',
  };

  const baseClasses = 'block w-full rounded-xl border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 disabled:opacity-50 disabled:cursor-not-allowed text-text-primary';
  
  const inputClasses = twMerge(
    clsx(
      baseClasses,
      variants[variant],
      sizes[size],
      error && 'border-accent-danger focus:border-accent-danger focus:ring-accent-danger/20',
      icon && 'pl-10',
      className
    )
  );

  return (
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-secondary">
          {icon}
        </div>
      )}
      <input
        type={type}
        className={inputClasses}
        ref={ref}
        dir={dir}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-accent-danger">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

export const SearchInput = forwardRef(({
  className,
  ...props
}, ref) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-text-secondary">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="search"
        className={twMerge(clsx(
          'block w-full rounded-xl border border-bg-secondary bg-bg-secondary pr-10 pl-4 py-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary text-text-primary',
          className
        ))}
        placeholder="חיפוש..."
        dir="rtl"
        ref={ref}
        {...props}
      />
    </div>
  );
}); 