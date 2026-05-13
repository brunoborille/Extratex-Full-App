import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  accent?: 'copper' | 'gold' | 'silver' | 'emerald' | 'none';
  noPadding?: boolean;
}

const accentMap = {
  copper: 'border-t-2 border-t-blue-500',
  gold:   'border-t-2 border-t-amber-500',
  silver: 'border-t-2 border-t-slate-400',
  emerald:'border-t-2 border-t-emerald-500',
  none:   '',
};

export function Card({ title, subtitle, children, className = '', headerAction, accent = 'none', noPadding = false }: CardProps) {
  return (
    <div className={`card ${accentMap[accent]} ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-gray-800 leading-tight">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && (
            <div className="flex-shrink-0">{headerAction}</div>
          )}
        </div>
      )}
      <div className={noPadding ? '' : 'px-6 py-5'}>
        {children}
      </div>
    </div>
  );
}
