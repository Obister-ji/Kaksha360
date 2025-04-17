import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none';
  padding?: boolean;
  centered?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
  none: '',
};

const ResponsiveContainer = ({
  children,
  maxWidth = 'xl',
  padding = true,
  centered = true,
  className,
  ...props
}: ResponsiveContainerProps) => {
  return (
    <div
      className={cn(
        'w-full',
        maxWidthClasses[maxWidth],
        padding && 'px-4 sm:px-6 md:px-8',
        centered && 'mx-auto',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { ResponsiveContainer };
