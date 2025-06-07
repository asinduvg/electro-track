import React from 'react';
import {cn} from '../../utils/cn';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({children, className}) => {
    return (
        <div className={cn('bg-white dark:bg-[#484848] rounded-xl shadow-sm border border-[#DDDDDD] dark:border-[#767676] hover:shadow-md transition-shadow duration-200 overflow-hidden', className)}>
            {children}
        </div>
    );
};

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({children, className}) => {
    return (
        <div className={cn('px-6 py-5 border-b border-[#EBEBEB] dark:border-[#767676]', className)}>
            {children}
        </div>
    );
};

interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({children, className}) => {
    return (
        <h3 className={cn('text-xl font-semibold text-[#222222] dark:text-white leading-tight', className)}>
            {children}
        </h3>
    );
};

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({children, className}) => {
    return (
        <div className={cn('px-6 py-5', className)}>
            {children}
        </div>
    );
};

interface CardFooterProps {
    children: React.ReactNode;
    className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({children, className}) => {
    return (
        <div className={cn('px-6 py-4 bg-gray-50 dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600', className)}>
            {children}
        </div>
    );
};