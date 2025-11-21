import React from 'react';

export interface CardProps {
    children: React.ReactNode;
    variant?: 'default' | 'gradient' | 'glass' | 'bordered';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
    className?: string;
    header?: React.ReactNode;
    footer?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
    children,
    variant = 'default',
    padding = 'md',
    hover = false,
    className = '',
    header,
    footer,
}) => {
    const baseStyles = 'rounded-xl transition-all duration-300';

    const variantStyles = {
        default: 'bg-white shadow-md',
        gradient: 'bg-gradient-to-br from-green-50 to-blue-50 shadow-lg',
        glass: 'bg-white/10 backdrop-blur-md border border-white/20 shadow-xl',
        bordered: 'bg-white border-2 border-gray-200',
    };

    const paddingStyles = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    const hoverStyles = hover ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : '';

    return (
        <div className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`}>
            {header && (
                <div className={`border-b border-gray-200 ${paddingStyles[padding]} pb-4`}>
                    {header}
                </div>
            )}
            <div className={header || footer ? paddingStyles[padding] : paddingStyles[padding]}>
                {children}
            </div>
            {footer && (
                <div className={`border-t border-gray-200 ${paddingStyles[padding]} pt-4`}>
                    {footer}
                </div>
            )}
        </div>
    );
};

export default Card;
