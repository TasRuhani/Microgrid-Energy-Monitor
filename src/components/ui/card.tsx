'use client';
import React from 'react';

export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-slate-800/60 backdrop-blur-md border border-slate-700/50 text-white rounded-xl shadow-lg p-6 ${className}`}>
    {children}
  </div>
);