import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  unit?: string;
  hint?: string;
}

export function Input({
  label,
  error,
  unit,
  hint,
  className = '',
  id,
  readOnly,
  ...props
}: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          readOnly={readOnly}
          className={`
            w-full px-3.5 py-2.5 text-sm border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
            transition-all duration-150
            ${error ? 'border-red-400 bg-red-50' : 'border-gray-200'}
            ${readOnly ? 'bg-slate-50 text-slate-600 border-slate-200 cursor-default' : 'bg-white hover:border-gray-300'}
            ${unit ? 'pr-14' : ''}
            ${className}
          `}
          style={{ boxShadow: readOnly ? 'inset 0 1px 3px rgba(0,0,0,0.06)' : 'inset 0 1px 2px rgba(0,0,0,0.04)' }}
          {...props}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium pointer-events-none select-none">
            {unit}
          </span>
        )}
      </div>
      {hint && !error && (
        <p className="mt-1 text-xs text-gray-400">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}
