import React from 'react';
import { cn } from '@/lib/utils';

export const Spinner = ({ className, size = 'md', ...props }) => {
  const sizeClasses = {
    xs: 'h-3.5 w-3.5 border-[1.5px]',
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-2',
    xl: 'h-16 w-16 border-[3px]'
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-zinc-200 border-t-indigo-600',
        sizeClasses[size] || sizeClasses.md,
        className
      )}
      {...props}
    />
  );
};

export default Spinner;
