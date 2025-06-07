import React from 'react';
import {cn} from '../../utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
                                                  children,
                                                  variant = 'primary',
                                                  size = 'md',
                                                  isLoading = false,
                                                  leftIcon,
                                                  rightIcon,
                                                  fullWidth = false,
                                                  className,
                                                  disabled,
                                                  ...props
                                              }) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border';

    const variantStyles: Record<ButtonVariant, string> = {
        primary: 'bg-[#FF385C] text-white hover:bg-[#E00B41] border-[#FF385C] hover:border-[#E00B41] focus:ring-[#FF385C] shadow-md hover:shadow-lg',
        secondary: 'bg-white text-[#222222] hover:bg-[#F7F7F7] border-[#DDDDDD] hover:border-[#B0B0B0] focus:ring-[#DDDDDD] shadow-sm hover:shadow-md',
        success: 'bg-[#008489] text-white hover:bg-[#00656A] border-[#008489] hover:border-[#00656A] focus:ring-[#008489] shadow-md hover:shadow-lg',
        danger: 'bg-[#C4141C] text-white hover:bg-[#A00F16] border-[#C4141C] hover:border-[#A00F16] focus:ring-[#C4141C] shadow-md hover:shadow-lg',
        warning: 'bg-[#FC642D] text-white hover:bg-[#E0562A] border-[#FC642D] hover:border-[#E0562A] focus:ring-[#FC642D] shadow-md hover:shadow-lg',
        outline: 'bg-transparent text-[#222222] hover:bg-[#F7F7F7] border-[#222222] hover:border-[#000000] focus:ring-[#222222] hover:shadow-sm',
        ghost: 'bg-transparent text-[#717171] hover:bg-[#F7F7F7] border-transparent hover:border-[#DDDDDD] focus:ring-[#717171] hover:shadow-sm'
    };

    const sizeStyles: Record<ButtonSize, string> = {
        sm: 'text-sm px-3 py-1.5 h-8',
        md: 'text-sm px-6 py-2.5 h-10',
        lg: 'text-base px-8 py-3 h-12'
    };

    const disabledStyles = 'opacity-50 cursor-not-allowed';
    const widthStyles = fullWidth ? 'w-full' : '';

    return (
        <button
            disabled={disabled || isLoading}
            className={cn(
                baseStyles,
                variantStyles[variant],
                sizeStyles[size],
                (disabled || isLoading) && disabledStyles,
                widthStyles,
                className
            )}
            {...props}
        >
            {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg"
                     fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                            strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
        </button>
    );
};