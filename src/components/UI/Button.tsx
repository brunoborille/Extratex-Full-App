import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled,
  loading,
  ...props
}: ButtonProps) {
  const base = [
    'inline-flex items-center justify-center gap-2 font-semibold rounded-lg',
    'transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:scale-[0.97] whitespace-nowrap select-none',
  ].join(' ');

  const variants = {
    primary:   'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white focus:ring-blue-500 shadow-sm hover:shadow-md',
    secondary: 'bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 focus:ring-gray-400 border border-gray-300 shadow-sm',
    success:   'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white focus:ring-emerald-500 shadow-sm hover:shadow-md',
    danger:    'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white focus:ring-red-500 shadow-sm',
    warning:   'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white focus:ring-amber-400 shadow-sm',
    ghost:     'bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-600 focus:ring-gray-400 border border-transparent',
  };

  const sizes = {
    xs: 'h-7 px-3 text-xs min-w-[80px]',
    sm: 'h-8 px-3.5 text-xs min-w-[100px]',
    md: 'h-10 px-4 text-sm min-w-[120px]',
    lg: 'h-12 px-6 text-base min-w-[160px]',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
