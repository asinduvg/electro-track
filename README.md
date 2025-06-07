# ElectroTrack - Enterprise Inventory Management System

A comprehensive inventory management system built with React, TypeScript, and PostgreSQL, designed for electronic component tracking and warehouse management.

## Features

### Core Functionality
- **Real-time Inventory Tracking** - Monitor stock levels across multiple locations
- **Transaction Management** - Complete audit trail of all inventory movements
- **Supplier Management** - Full supplier relationship management with real database integration
- **Location Management** - Multi-warehouse and location tracking
- **Category Management** - Hierarchical product categorization
- **User Management** - Role-based access control and permissions

### Enterprise Features
- **Advanced Analytics** - Real-time inventory insights and performance metrics
- **Stock Alerts** - Automated low stock and out-of-stock notifications
- **Role-based Permissions** - Granular access control for different user types
- **Report Generation** - CSV export capabilities for all data
- **Mobile Responsive** - Full functionality across all device sizes
- **Real-time Monitoring** - Live dashboard with key performance indicators

### Technical Features
- **Airbnb Design System** - Modern squared button styling with #FF385C theme
- **PostgreSQL Database** - Robust data persistence with Drizzle ORM
- **Authentication System** - Secure user login and session management
- **API Integration** - RESTful API with comprehensive error handling
- **Performance Optimized** - Debounced searches, memoized calculations
- **Error Boundaries** - Comprehensive error handling and recovery

## User Roles & Permissions

### Admin
- Full system access and configuration
- User management and role assignment
- System settings and configuration
- All CRUD operations

### Inventory Manager
- Inventory and supplier management
- Report generation and analytics
- Transaction oversight
- Location management

### Warehouse Staff
- Item transactions and movements
- Basic inventory operations
- Location updates

### Department User
- Read-only access to relevant inventory
- Basic search and view capabilities

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: React Query for server state
- **UI Components**: Custom Airbnb-themed component library
- **Icons**: Lucide React
- **Routing**: React Router v6

## Quick Start

1. **Database Setup**: PostgreSQL database is automatically configured
2. **Schema Migration**: Run `npm run db:push` to create tables
3. **Start Application**: Run `npm run dev` to start both frontend and backend
4. **Default Login**: admin@et.com / admin123

## API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication

### Inventory
- `GET /api/items` - List all items
- `POST /api/items` - Create new item
- `PATCH /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Suppliers
- `GET /api/suppliers` - List all suppliers
- `POST /api/suppliers` - Create new supplier
- `PATCH /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier

### Locations
- `GET /api/locations` - List all locations
- `POST /api/locations` - Create new location

### Transactions
- `GET /api/transactions` - Transaction history
- `POST /api/transactions` - Create transaction

## Database Schema

### Core Tables
- `users` - User accounts and roles
- `items` - Inventory items with full specifications
- `locations` - Warehouse locations and storage units
- `suppliers` - Supplier information and contacts
- `categories` - Product categorization system
- `transactions` - Complete audit trail
- `item_locations` - Stock levels by location

### Advanced Tables
- `alerts` - Stock alerts and notifications
- `user_activity` - User action logging
- `purchase_orders` - Purchase order management
- `stock_reservations` - Inventory reservations

## Security Features

- Role-based access control (RBAC)
- Input validation and sanitization
- SQL injection prevention
- Session-based authentication
- Error boundary protection

## Performance Optimizations

- Debounced search functionality
- Memoized calculations
- Efficient database queries
- Component lazy loading
- Image optimization

## Mobile Support

- Responsive design for all screen sizes
- Touch-friendly interface
- Mobile navigation menu
- Optimized data loading

## Production Ready

- Comprehensive error handling
- Performance monitoring
- Security best practices
- Scalable architecture
- Database optimization
- Real-time data synchronization

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

Enterprise Inventory Management System - All rights reserved.