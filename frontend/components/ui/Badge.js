'use client';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const variants = {
  primary: 'bg-accent-primary/10 text-accent-primary',
  secondary: 'bg-accent-secondary/10 text-accent-secondary',
  success: 'bg-success/10 text-success',
  warning: 'bg-accent-warning/10 text-accent-warning',
  danger: 'bg-accent-danger/10 text-accent-danger',
  info: 'bg-info/10 text-info',
  outline: 'bg-transparent border border-current',
};

const sizes = {
  sm: 'text-xs py-0.5 px-2',
  md: 'text-sm py-1 px-3',
  lg: 'text-base py-1.5 px-4',
};

export default function Badge({
  children,
  className,
  variant = 'primary',
  size = 'sm',
  glow = false,
  pulse = false,
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full';
  
  const badgeClasses = twMerge(
    clsx(
      baseClasses,
      variants[variant],
      sizes[size],
      glow && 'glow',
      pulse && 'animate-pulse',
      className
    )
  );

  return (
    <span className={badgeClasses} {...props}>
      {children}
    </span>
  );
}

export function StatusBadge({ status, className, ...props }) {
  const statusMap = {
    active: { variant: 'success', label: 'פעיל', icon: '●' },
    inactive: { variant: 'danger', label: 'לא פעיל', icon: '●' },
    pending: { variant: 'warning', label: 'ממתין', icon: '●' },
    processing: { variant: 'info', label: 'מעבד', icon: '●' },
  };

  const { variant, label, icon } = statusMap[status] || statusMap.inactive;

  return (
    <Badge 
      variant={variant} 
      className={twMerge(clsx('gap-1.5', className))} 
      glow={status === 'active'} 
      pulse={status === 'processing'}
      {...props}
    >
      <span className="text-xs">{icon}</span>
      <span>{label}</span>
    </Badge>
  );
} 