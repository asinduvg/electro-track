import React from 'react';
import { Skeleton, CardSkeleton, TableRowSkeleton, ListItemSkeleton } from './Skeleton';
import { cn } from '@/utils/cn';

// Dashboard Stats Skeleton
export const DashboardStatsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-12" />
            </div>
            <Skeleton className="h-12 w-12 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Inventory Table Skeleton
interface InventoryTableSkeletonProps {
  rows?: number;
  className?: string;
}

export const InventoryTableSkeleton: React.FC<InventoryTableSkeletonProps> = ({
  rows = 10,
  className
}) => {
  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700', className)}>
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </div>
      </div>
      
      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {['Item', 'Category', 'Location', 'Stock', 'Status', 'Actions'].map((_, i) => (
                <th key={i} className="px-6 py-3 text-left">
                  <Skeleton className="h-4 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <TableRowSkeleton key={i} columns={6} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Item Card Grid Skeleton
interface ItemCardGridSkeletonProps {
  count?: number;
  className?: string;
}

export const ItemCardGridSkeleton: React.FC<ItemCardGridSkeletonProps> = ({
  count = 12,
  className
}) => {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <Skeleton className="h-32 w-full mb-4 rounded-md" />
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-3" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Form Skeleton
export const FormSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 mb-6" />
        
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ))}
        
        <div className="flex space-x-3 pt-4">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
};

// Analytics Chart Skeleton
export const AnalyticsChartSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
      <Skeleton className="h-64 w-full rounded-md" />
    </div>
  );
};

// Supplier List Skeleton
export const SupplierListSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {Array.from({ length: 8 }).map((_, i) => (
        <ListItemSkeleton 
          key={i} 
          showAvatar={true} 
          showAction={true}
          className={i === 7 ? 'border-b-0' : ''}
        />
      ))}
    </div>
  );
};

// Transaction History Skeleton
export const TransactionHistorySkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <Skeleton className="h-6 w-40" />
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Location Grid Skeleton
export const LocationGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-4" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Search Results Skeleton
export const SearchResultsSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-start space-x-4">
            <Skeleton className="h-16 w-16 rounded-md flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex items-center space-x-4 mt-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Add Item Form Skeleton - matches Items tab quality
export const AddItemFormSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 animate-pulse" />
            <Skeleton className="h-5 w-64 animate-pulse" />
          </div>
        </div>
        
        {/* Form Card with proper shadow and styling */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Skeleton className="h-6 w-6 mr-2 animate-pulse" />
              <Skeleton className="h-6 w-32 animate-pulse" />
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24 animate-pulse" />
                  <Skeleton className="h-10 w-full rounded-md animate-pulse" />
                </div>
              ))}
            </div>
            
            {/* Description Field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20 animate-pulse" />
              <Skeleton className="h-20 w-full rounded-md animate-pulse" />
            </div>
            
            {/* Image Upload Section */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-28 animate-pulse" />
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <Skeleton className="h-32 w-full rounded-md animate-pulse" />
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="pt-4">
              <Skeleton className="h-10 w-32 rounded-md animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Receive Items Page Skeleton - matches Items tab quality
export const ReceiveItemsSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header matching Items tab style */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 animate-pulse" />
            <Skeleton className="h-5 w-64 animate-pulse" />
          </div>
        </div>
        
        {/* Search Items Card with proper styling */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Skeleton className="h-5 w-5 mr-2 animate-pulse" />
              <Skeleton className="h-6 w-48 animate-pulse" />
            </div>
          </div>
          
          <div className="p-6">
            {/* Search Input */}
            <div className="mb-4">
              <Skeleton className="h-10 w-64 rounded-md animate-pulse" />
            </div>
            
            {/* Items Table matching InventoryTableSkeleton structure */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['SKU', 'Name', 'Current Stock', 'Actions'].map((_, i) => (
                      <th key={i} className="px-6 py-3 text-left">
                        <Skeleton className="h-4 w-16 animate-pulse" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-200">
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-20 animate-pulse" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32 animate-pulse" />
                          <Skeleton className="h-3 w-24 animate-pulse" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-6 w-16 rounded-full animate-pulse" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-8 w-16 rounded-md animate-pulse" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6">
          <Skeleton className="h-14 w-14 rounded-full animate-pulse shadow-lg" />
        </div>
      </div>
    </div>
  );
};

// Withdraw Items Page Skeleton - matches Items tab quality
export const WithdrawItemsSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header matching Items tab style */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 animate-pulse" />
            <Skeleton className="h-5 w-64 animate-pulse" />
          </div>
        </div>
        
        {/* Search Items Card with proper styling */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Skeleton className="h-5 w-5 mr-2 animate-pulse" />
              <Skeleton className="h-6 w-48 animate-pulse" />
            </div>
          </div>
          
          <div className="p-6">
            {/* Search Input */}
            <div className="mb-4">
              <Skeleton className="h-10 w-64 rounded-md animate-pulse" />
            </div>
            
            {/* Items Table matching InventoryTableSkeleton structure */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['SKU', 'Name', 'Total Stock', 'Status', 'Actions'].map((_, i) => (
                      <th key={i} className="px-6 py-3 text-left">
                        <Skeleton className="h-4 w-16 animate-pulse" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-200">
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-20 animate-pulse" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32 animate-pulse" />
                          <Skeleton className="h-3 w-24 animate-pulse" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-12 animate-pulse" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-6 w-20 rounded-full animate-pulse" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-8 w-16 rounded-md animate-pulse" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6">
          <Skeleton className="h-14 w-14 rounded-full animate-pulse shadow-lg" />
        </div>
      </div>
    </div>
  );
};

// Transfer Items Page Skeleton - matches Items tab quality
export const TransferItemsSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header matching Items tab style */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 animate-pulse" />
            <Skeleton className="h-5 w-64 animate-pulse" />
          </div>
        </div>
        
        {/* Search Items Card with proper styling */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Skeleton className="h-5 w-5 mr-2 animate-pulse" />
              <Skeleton className="h-6 w-48 animate-pulse" />
            </div>
          </div>
          
          <div className="p-6">
            {/* Search Input */}
            <div className="mb-4">
              <Skeleton className="h-10 w-64 rounded-md animate-pulse" />
            </div>
            
            {/* Items Table matching InventoryTableSkeleton structure */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {["SKU", "Name", "Total Stock", "Locations", "Actions"].map((_, i) => (
                      <th key={i} className="px-6 py-3 text-left">
                        <Skeleton className="h-4 w-16 animate-pulse" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-200">
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-20 animate-pulse" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32 animate-pulse" />
                          <Skeleton className="h-3 w-24 animate-pulse" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-12 animate-pulse" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          <Skeleton className="h-6 w-16 rounded-full animate-pulse" />
                          <Skeleton className="h-6 w-16 rounded-full animate-pulse" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-8 w-16 rounded-md animate-pulse" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6">
          <Skeleton className="h-14 w-14 rounded-full animate-pulse shadow-lg" />
        </div>
      </div>
    </div>
  );
};
