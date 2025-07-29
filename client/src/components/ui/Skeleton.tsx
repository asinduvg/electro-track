import React from 'react';
import { cn } from '@/utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'shimmer' | 'pulse';
}

const Skeleton: React.FC<SkeletonProps> = ({ className, variant = 'shimmer' }) => {
  const variantClasses = {
    default: 'bg-gray-200 dark:bg-gray-700',
    shimmer:
      'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]',
    pulse: 'bg-gray-200 dark:bg-gray-700 animate-pulse',
  };

  return <div className={cn('rounded-md', variantClasses[variant], className)} />;
};

// Card Skeleton Component
interface CardSkeletonProps {
  className?: string;
  showImage?: boolean;
  lines?: number;
}

const CardSkeleton: React.FC<CardSkeletonProps> = ({ className, showImage = true, lines = 3 }) => {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800',
        className
      )}
    >
      {showImage && <Skeleton className="mb-4 h-40 w-full" />}
      <Skeleton className="mb-3 h-6 w-3/4" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('mb-2 h-4', i === lines - 1 ? 'w-1/2' : 'w-full')} />
      ))}
    </div>
  );
};

// Table Row Skeleton
interface TableRowSkeletonProps {
  columns: number;
  className?: string;
}

const TableRowSkeleton: React.FC<TableRowSkeletonProps> = ({ columns, className }) => {
  return (
    <tr className={cn('border-b border-gray-200 dark:border-gray-700', className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
};

// List Item Skeleton
interface ListItemSkeletonProps {
  className?: string;
  showAvatar?: boolean;
  showAction?: boolean;
}

const ListItemSkeleton: React.FC<ListItemSkeletonProps> = ({
  className,
  showAvatar = false,
  showAction = false,
}) => {
  return (
    <div
      className={cn(
        'flex items-center space-x-4 border-b border-gray-200 p-4 dark:border-gray-700',
        className
      )}
    >
      {showAvatar && <Skeleton className="h-10 w-10 rounded-full" />}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      {showAction && <Skeleton className="h-8 w-20 rounded-md" />}
    </div>
  );
};

// Page Skeleton for full page loading
interface PageSkeletonProps {
  className?: string;
  showHeader?: boolean;
  showSidebar?: boolean;
}

const PageSkeleton: React.FC<PageSkeletonProps> = ({
  className,
  showHeader = true,
  showSidebar = false,
}) => {
  return (
    <div className={cn('min-h-screen bg-gray-50 dark:bg-gray-900', className)}>
      {showHeader && (
        <div className="border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {showSidebar && (
          <div className="w-64 border-r border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Skeleton, CardSkeleton, TableRowSkeleton, ListItemSkeleton, PageSkeleton };
