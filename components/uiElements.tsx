import React, { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className,
  ...props
}) => {
  const baseStyle = "font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-150 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  
  // Using Tailwind's arbitrary value syntax for CSS variables
  const variantStyles = {
    primary: "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text-inverted)] focus:ring-[var(--color-primary)]",
    secondary: "bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-hover)] text-[var(--color-text-base)] focus:ring-[var(--color-secondary)]",
    danger: "bg-[var(--color-danger)] hover:bg-[var(--color-danger-hover)] text-[var(--color-text-inverted)] focus:ring-[var(--color-danger)]",
    ghost: "bg-transparent hover:bg-[var(--color-secondary)] text-[var(--color-text-muted)] focus:ring-[var(--color-secondary)] border border-[var(--color-border)]",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {icon && !isLoading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className, text }) => {
  const sizeMap = { sm: 'h-6 w-6', md: 'h-10 w-10', lg: 'h-16 w-16' };
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className={`${sizeMap[size]} animate-spin text-[var(--color-primary)]`} />
      {text && <p className="mt-2 text-sm text-[var(--color-text-muted)]">{text}</p>}
    </div>
  );
};


interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-card-background)] rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <h3 className="text-lg font-semibold text-[var(--color-text-base)]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] transition-colors"
            aria-label="إغلاق"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
        {footer && (
          <div className="p-4 border-t border-[var(--color-border)] bg-slate-50 rounded-b-lg"> {/* bg-slate-50 can be themed too if needed */}
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};


interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  message?: string;
  children?: ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ 
  type = 'info', 
  message, 
  children, 
  onClose, 
  className = '' 
}) => {
  const baseClasses = "p-4 rounded-md text-sm flex items-start";
  // These could also be themed further if specific shades are needed via CSS vars
  const typeClasses = {
    success: "bg-green-50 text-green-700 border border-green-200",
    error: "bg-red-50 text-red-700 border border-red-200",
    warning: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    info: "bg-blue-50 text-blue-700 border border-blue-200", // Consider var(--color-primary-light) or similar
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${className}`} role="alert">
      <div className="flex-grow">
        {message && <span>{message}</span>}
        {children}
      </div>
      {onClose && (
        <button onClick={onClose} className="ml-4 -mr-1 -my-1 p-1 rounded hover:bg-opacity-20" aria-label="Dismiss">
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      )}
    </div>
  );
};