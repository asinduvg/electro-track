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