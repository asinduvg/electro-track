import React from 'react';
import {cn} from '../../utils/cn';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
                                                children,
                                                variant = 'primary',
                                                className
                                            }) => {
    const variantStyles: Record<BadgeVariant, string> = {
        primary: 'bg-[#FFF3F4] text-[#FF385C] border border-[#FFD4DD]',
        secondary: 'bg-[#F7F7F7] text-[#717171] border border-[#DDDDDD]',
        success: 'bg-[#E6F7F7] text-[#008489] border border-[#B3E5E6]',
        danger: 'bg-[#FFF2F2] text-[#C4141C] border border-[#F5B5B5]',
        warning: 'bg-[#FFF4E6] text-[#FC642D] border border-[#FFD1A3]',
        info: 'bg-[#E6F2FF] text-[#1A73E8] border border-[#B3D9FF]'
    };

    return (
        <span
            className={cn(
                'inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium',
                variantStyles[variant],
                className
            )}
        >
      {children}
    </span>
    );
};