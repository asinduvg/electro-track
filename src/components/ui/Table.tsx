import React from 'react';
import { cn } from '../../utils/cn';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ 
  children, 
  className, 
  ...props 
}) => {
  return (
    <div className="overflow-x-auto">
      <table
        className={cn(
          'min-w-full divide-y divide-gray-200',
          className
        )}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

interface TableHeadProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableHead: React.FC<TableHeadProps> = ({ 
  children, 
  className, 
  ...props 
}) => {
  return (
    <thead
      className={cn('bg-gray-50', className)}
      {...props}
    >
      {children}
    </thead>
  );
};

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableBody: React.FC<TableBodyProps> = ({ 
  children, 
  className, 
  ...props 
}) => {
  return (
    <tbody
      className={cn(
        'bg-white divide-y divide-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </tbody>
  );
};

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

export const TableRow: React.FC<TableRowProps> = ({ 
  children, 
  className, 
  ...props 
}) => {
  return (
    <tr
      className={cn(
        'hover:bg-gray-50 transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
};

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export const TableCell: React.FC<TableCellProps> = ({ 
  children, 
  className, 
  ...props 
}) => {
  return (
    <td
      className={cn(
        'px-6 py-4 whitespace-nowrap text-sm text-gray-500',
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
};

interface TableHeaderCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({ 
  children, 
  className, 
  ...props 
}) => {
  return (
    <th
      className={cn(
        'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
};