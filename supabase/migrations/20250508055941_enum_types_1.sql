-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'inventory_manager', 'warehouse_staff', 'department_user');
CREATE TYPE item_status AS ENUM ('in_stock', 'low_stock', 'out_of_stock', 'discontinued');
CREATE TYPE transaction_type AS ENUM ('receive', 'transfer', 'dispose', 'withdraw', 'adjust');
CREATE TYPE item_location_status AS ENUM ('in_stock', 'ordered');