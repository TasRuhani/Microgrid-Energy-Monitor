'use client';
import React from 'react';

export const Button = ({ children, onClick, className, variant = 'default' }: { children: React.ReactNode; onClick: () => void; className?: string; variant?: 'default' | 'primary' | 'destructive' | 'ghost' }) => {
  const baseClasses = 'px-4 py-2 font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900';
  let variantClasses = '';
  switch (variant) {
    case 'primary':
      variantClasses = 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-700';
      break;
    case 'destructive':
      variantClasses = 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      break;
    case 'ghost':
      variantClasses = 'bg-transparent text-slate-400 hover:bg-slate-700 focus:ring-slate-500';
      break;
    default:
      variantClasses = 'bg-slate-700 hover:bg-slate-600 focus:ring-slate-500';
  }
  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </button>
  );
};
