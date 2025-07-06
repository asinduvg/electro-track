# ElectroTrack - Enterprise Inventory Management System

## Overview

ElectroTrack is a comprehensive inventory management system designed for electronic component tracking and warehouse management. It features a modern React frontend with TypeScript, a Node.js/Express backend, and PostgreSQL database with Drizzle ORM. The system provides real-time inventory tracking, transaction management, supplier relationships, and role-based access control.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with Tailwind CSS
- **State Management**: Custom React hooks with context providers
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with Airbnb design system (#FF385C theme)
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful API with comprehensive error handling
- **Authentication**: Custom authentication system with role-based permissions

### Database Architecture
- **ORM**: Drizzle ORM with TypeScript schema definitions
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Schema**: Shared schema definitions between frontend and backend
- **Migrations**: Drizzle Kit for database migrations

## Key Components

### Core Modules
1. **Inventory Management**: Full CRUD operations for items with real-time stock tracking
2. **Location Management**: Multi-warehouse and storage unit tracking
3. **Transaction System**: Complete audit trail for all inventory movements
4. **Supplier Management**: Comprehensive supplier relationship management
5. **Category Management**: Hierarchical product categorization
6. **User Management**: Role-based access control with four user roles

### Authentication & Authorization
- **Role Hierarchy**: Admin > Inventory Manager > Warehouse Staff > Department User
- **Permission System**: Action-based permissions with granular access control
- **Session Management**: Secure session handling with automatic cleanup

### UI/UX Features
- **Design System**: Airbnb-inspired design with squared buttons and #FF385C primary color
- **Responsive Design**: Mobile-first approach with adaptive navigation
- **Dark Mode**: System-wide dark mode support
- **Error Boundaries**: Comprehensive error handling with user-friendly fallbacks
- **Loading States**: Skeleton components for better perceived performance

## Data Flow

### Frontend Data Flow
1. **Context Providers**: Multiple context providers for auth, database, and settings
2. **Custom Hooks**: Abstracted data fetching with automatic error handling
3. **API Client**: Centralized API client replacing Supabase functionality
4. **State Management**: Local state with hooks, no external state management library

### Backend Data Flow
1. **Request Handling**: Express middleware for parsing and logging
2. **Database Operations**: Drizzle ORM with connection pooling
3. **Error Handling**: Global error handling middleware
4. **Response Formatting**: Consistent JSON response format

### Database Schema
- **Users**: Role-based user management with audit fields
- **Items**: Product information with categories and stock tracking
- **Locations**: Hierarchical location structure (building > room > unit)
- **Transactions**: Complete transaction history with metadata
- **Suppliers**: Supplier information with relationship tracking
- **Categories**: Hierarchical category system with main/subcategories

## External Dependencies

### Frontend Dependencies
- **React Ecosystem**: React, React Router, React Query (TanStack)
- **UI Components**: Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom configuration
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React icon library

### Backend Dependencies
- **Database**: Neon serverless PostgreSQL
- **ORM**: Drizzle ORM with PostgreSQL adapter
- **Authentication**: Custom implementation with session management
- **File Upload**: Supabase for image storage (deferred implementation)

### Build Dependencies
- **Bundler**: Vite with React plugin
- **TypeScript**: Strict type checking across the stack
- **ESBuild**: Fast bundling for production builds
- **Development**: Replit-specific plugins for development environment

## Deployment Strategy

### Development Environment
- **Platform**: Replit with automatic environment provisioning
- **Database**: Neon serverless PostgreSQL (automatically provisioned)
- **Hot Reload**: Vite development server with HMR
- **Error Handling**: Runtime error overlay for development

### Production Build
- **Frontend**: Vite build with optimized bundle splitting
- **Backend**: ESBuild compilation to single bundle
- **Static Assets**: Served from dist/public directory
- **Environment**: Node.js production environment

### Database Strategy
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Connection pooling with Neon serverless
- **Backup**: Built-in Neon backup and recovery
- **Performance**: Optimized queries with proper indexing

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 05, 2025. Initial setup
- July 05, 2025. Fixed UI consistency issues:
  * Fixed status color inconsistency - low stock now shows orange (warning) across all pages
  * Removed confusing "Remove" buttons and replaced with clear "×" icons in withdraw/receive tables
  * Moved primary action buttons (Withdraw/Receive) to prominent bottom-right floating position
  * Fixed stock status logic - items with 0 stock now correctly show "Out of Stock" instead of "Low Stock"
  * Added color-coded stock numbers to main inventory page (red=0, orange=low, green=normal)
  * Enforced minimum stock validation to be greater than 0 (minimum value is 1)
- July 05, 2025. Implemented comprehensive tab-based inventory system:
  * Created unified inventory page with five tabs: Items, Add Item, Receive, Withdraw, Transfer
  * Moved Add Item tab to second position with PackagePlus icon (box with plus symbol)
  * Removed all "Back to Inventory" buttons from embedded pages within tabs
  * Removed all "Add New Item" buttons from Items tab to eliminate duplication
  * Created new AddItemForm component that works properly within tab system
  * Removed standalone /inventory/add route - all functionality now in tabs
  * Fixed add item functionality to work without navigation dependencies
- July 05, 2025. Enhanced inventory system with validation and UI improvements:
  * Added comprehensive image upload functionality to Add Item tab with drag-drop, preview, and 5MB validation
  * Added unit cost validation to prevent negative values (HTML min attribute and form validation)
  * Refactored main inventory URL from '/inventory/items' to '/inventory' for cleaner navigation
  * Removed separate receive (/inventory/receive) and withdraw (/inventory/withdraw) routes
  * Removed Filter button from inventory items list as requested
  * Added skeleton loading components to Receive and Withdraw tabs for consistent UI
  * Updated all navigation links and dashboard references to use new '/inventory' URL
- July 05, 2025. Implemented Transfer tab functionality:
  * Created TransferItemsComponent to handle item transfers between locations
  * Integrated transfer functionality directly into inventory tabs system
  * Added comprehensive validation for stock availability and location differences
  * Implemented floating action button for transfer submission
  * Added proper skeleton loading states for transfer tab
  * Removed standalone /inventory/transfer route and TransferItemsPage
  * Updated Header component to remove obsolete transfer route reference
- July 06, 2025. Cleaned up navigation and UI consistency:
  * Removed Add Component, Receive Items, Withdraw Items, and Transfer Items from dashboard quick actions
  * Fixed item detail page back button to navigate to main inventory page (/inventory) instead of /inventory/items
  * Updated Transfer tab action button from "Add" to "Transfer" with double arrows (⇄)
  * Maintained only Generate Report button in dashboard quick actions for essential functionality