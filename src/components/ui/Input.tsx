import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    helperText?: string;
    error?: string;
    fullWidth?: boolean;
    leftAddon?: React.ReactNode;
    rightAddon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({
         className,
         label,
         helperText,
         error,
         fullWidth = false,
         leftAddon,
         rightAddon,
         ...props
     }, ref) => {
        return (
            <div className={cn(fullWidth && 'w-full')}>
                {label && (
                    <label
                        htmlFor={props.id}
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        {label}
                    </label>
                )}
                <div className={cn(
                    'relative rounded-md',
                    leftAddon && 'flex',
                )}>
                    {leftAddon && (
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              {leftAddon}
            </span>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            'block w-full px-3 py-2 border-2 rounded-md shadow-sm text-gray-900 placeholder-gray-400',
                            'focus:outline-none focus:ring-2 focus:ring-offset-0',
                            error
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
                            leftAddon && 'rounded-l-none',
                            rightAddon && 'rounded-r-none',
                            fullWidth && 'w-full',
                            className
                        )}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${props.id}-error` : props.id}
                        {...props}
                    />
                    {rightAddon && (
                        <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              {rightAddon}
            </span>
                    )}
                </div>
                {helperText && !error && (
                    <p className="mt-1 text-sm text-gray-500" id={`${props.id}-description`}>
                        {helperText}
                    </p>
                )}
                {error && (
                    <p className="mt-1 text-sm text-red-600" id={`${props.id}-error`}>
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';