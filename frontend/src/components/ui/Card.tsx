import React from 'react';

export interface CardProps {
    children: React.ReactNode;
    variant?: 'default' | 'glass' | 'gradient';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    hover?: boolean;
    className?: string;
}

const Card: React.FC<CardProps> = ({
    children,
    variant = 'default',
    padding = 'md',
    hover = false,
    className = '',
}) => {
    const baseStyles = 'rounded-xl transition-all duration-300';

    const variants = {
        default: 'bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700',
        glass: 'glass dark:glass-dark shadow-xl',
        gradient: 'bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 shadow-lg border border-white/50 dark:border-white/10',
    };

    const paddings = {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
    };

    const hoverStyles = hover ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : '';

    return (
        <div className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${hoverStyles} ${className}`}>
            {children}
        </div>
    );
};

export default Card;
