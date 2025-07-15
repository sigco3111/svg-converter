
import React from 'react';

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  as?: 'button' | 'a';
  href?: string;
  download?: string;
};

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  as = 'button',
  href,
  download
}) => {
  const baseClasses = "inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: 'bg-brand-primary text-white hover:bg-brand-secondary focus:ring-brand-secondary',
    secondary: 'bg-base-300 text-text-primary hover:bg-base-200 focus:ring-base-300'
  };

  const className = `${baseClasses} ${variantClasses[variant]}`;

  if (as === 'a') {
    return (
      <a href={href} download={download} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
