import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider";
  
  const variants = {
    primary: "bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)] focus:ring-cyan-500",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 focus:ring-slate-500",
    danger: "bg-red-500 hover:bg-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] focus:ring-red-500",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-300"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          LOADING...
        </span>
      ) : children}
    </button>
  );
};

export default Button;