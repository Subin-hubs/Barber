import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: "bg-navy text-white hover:bg-navy-hover",
  secondary: "bg-gold text-navy hover:bg-gold-hover",
  ghost: "bg-transparent border border-navy text-navy hover:bg-navy hover:text-white",
  danger: "bg-error text-white hover:bg-error/90"
};

export const Button = ({ 
  children, 
  variant = 'primary', 
  className, 
  isLoading, 
  disabled, 
  ...props 
}) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition-all duration-200",
        variants[variant],
        (disabled || isLoading) && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};
