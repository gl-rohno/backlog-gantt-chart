import React from 'react';

interface BaseButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  disabled?: boolean;
  title?: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'icon';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<BaseButtonProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
  title,
  type = 'button',
  variant = 'secondary',
  size = 'md',
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 border rounded';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700',
    secondary: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 hover:border-gray-400',
    outline: 'bg-transparent text-gray-700 border-gray-300 hover:bg-gray-50',
    icon: 'bg-transparent text-gray-500 border-gray-300 hover:bg-gray-100 hover:text-gray-700',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed pointer-events-none' 
    : '';

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`.trim();

  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
};