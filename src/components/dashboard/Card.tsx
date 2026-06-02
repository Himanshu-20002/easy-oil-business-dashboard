import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'elevated';
}

export function Card({ className = '', children, onClick, variant = 'default' }: CardProps) {
  const baseStyles = 'bg-white rounded-xl border border-slate-200 p-6';
  const variantStyles = {
    default: 'shadow-sm hover:shadow-md transition-shadow',
    elevated: 'shadow-md hover:shadow-lg transition-shadow'
  };
  
  return (
    <div 
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
