/*
  # Initial Schema Setup for Electronics Inventory Management

  1. New Tables
    - users
      - id (uuid, primary key)
      - email (text, unique)
      - role (text)
      - name (text)
      - department (text, optional)
      - created_at (timestamp)
      - last_login (timestamp)
    
    - items
      - id (uuid, primary key)
      - sku (text, unique)
      - name (text)
      - description (text)
      - category (text)
      - subcategory (text)
      - manufacturer (text)
      - model (text)
      - serial_number (text)
      - quantity (integer)
      - minimum_stock (integer)
      - unit_cost (numeric)
      - location_id (uuid, foreign key)
      - purchase_date (date)
      - warranty_expiration (date)
      - status (text)
      - created_at (timestamp)
      - updated_at (timestamp)
      - created_by (uuid, foreign key)

    - locations
      - id (uuid, primary key)
      - building (text)
      - room (text)
      - unit (text)
      - created_at (timestamp)

    - transactions
      - id (uuid, primary key)
      - type (text)
      - item_id (uuid, foreign key)
      - quantity (integer)
      - from_location_id (uuid, foreign key)
      - to_location_id (uuid, foreign key)
      - performed_by (uuid, foreign key)
      - performed_at (timestamp)
      - notes (text)

    - attachments
      - id (uuid, primary key)
      - item_id (uuid, foreign key)
      - name (text)
      - type (text)
      - url (text)
      - uploaded_at (timestamp)
      - uploaded_by (uuid, foreign key)

  2. Security
    - Enable RLS on all tables
    - Add policies for each table based on user roles
*/

-- -- Enable UUID extension
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -- Create enum types
-- CREATE TYPE user_role AS ENUM ('admin', 'inventory_manager', 'warehouse_staff', 'department_user');
-- CREATE TYPE item_status AS ENUM ('in_stock', 'low_stock', 'out_of_stock', 'ordered', 'discontinued');
-- CREATE TYPE transaction_type AS ENUM ('receive', 'transfer', 'dispose', 'adjust');

-- -- Create users table
-- CREATE TABLE IF NOT EXISTS users (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   email text UNIQUE NOT NULL,
--   role user_role NOT NULL,
--   name text NOT NULL,
--   department text,
--   created_at timestamptz DEFAULT now(),
--   last_login timestamptz
-- );

-- -- Create locations table
-- CREATE TABLE IF NOT EXISTS locations (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   building text,
--   room text,
--   unit text NOT NULL,
--   created_at timestamptz DEFAULT now()
-- );

-- -- Create items table
-- CREATE TABLE IF NOT EXISTS items (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   sku text UNIQUE NOT NULL,
--   name text NOT NULL,
--   description text,
--   category text NOT NULL,
--   subcategory text,
--   manufacturer text NOT NULL,
--   model text,
--   serial_number text,
--   quantity integer NOT NULL DEFAULT 0,
--   minimum_stock integer,
--   unit_cost numeric(10,2) NOT NULL,
--   location_id uuid REFERENCES locations(id),
--   purchase_date date,
--   warranty_expiration date,
--   status item_status NOT NULL DEFAULT 'in_stock',
--   created_at timestamptz DEFAULT now(),
--   updated_at timestamptz DEFAULT now(),
--   created_by uuid REFERENCES users(id)
-- );

-- -- Create transactions table
-- CREATE TABLE IF NOT EXISTS transactions (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   type transaction_type NOT NULL,
--   item_id uuid REFERENCES items(id) NOT NULL,
--   quantity integer NOT NULL,
--   from_location_id uuid REFERENCES locations(id),
--   to_location_id uuid REFERENCES locations(id),
--   performed_by uuid REFERENCES users(id) NOT NULL,
--   performed_at timestamptz DEFAULT now(),
--   notes text
-- );

-- -- Create attachments table
-- CREATE TABLE IF NOT EXISTS attachments (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   item_id uuid REFERENCES items(id) NOT NULL,
--   name text NOT NULL,
--   type text NOT NULL,
--   url text NOT NULL,
--   uploaded_at timestamptz DEFAULT now(),
--   uploaded_by uuid REFERENCES users(id) NOT NULL
-- );

-- -- Enable Row Level Security
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- -- Create policies for users table
-- CREATE POLICY "Users can view their own data"
--   ON users
--   FOR SELECT
--   TO authenticated
--   USING (auth.uid() = id);

-- CREATE POLICY "Admin can manage all users"
--   ON users
--   TO authenticated
--   USING (auth.jwt() ->> 'role' = 'admin');

-- -- Create policies for items table
-- CREATE POLICY "Everyone can view items"
--   ON items
--   FOR SELECT
--   TO authenticated
--   USING (true);

-- CREATE POLICY "Admin and inventory managers can manage items"
--   ON items
--   USING (
--     auth.jwt() ->> 'role' IN ('admin', 'inventory_manager')
--   );

-- -- Create policies for locations table
-- CREATE POLICY "Everyone can view locations"
--   ON locations
--   FOR SELECT
--   TO authenticated
--   USING (true);

-- CREATE POLICY "Admin and inventory managers can manage locations"
--   ON locations
--   USING (
--     auth.jwt() ->> 'role' IN ('admin', 'inventory_manager')
--   );

-- -- Create policies for transactions table
-- CREATE POLICY "Everyone can view transactions"
--   ON transactions
--   FOR SELECT
--   TO authenticated
--   USING (true);

-- CREATE POLICY "Staff can create transactions"
--   ON transactions
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (
--     auth.jwt() ->> 'role' IN ('admin', 'inventory_manager', 'warehouse_staff')
--   );

-- -- Create policies for attachments table
-- CREATE POLICY "Everyone can view attachments"
--   ON attachments
--   FOR SELECT
--   TO authenticated
--   USING (true);

-- CREATE POLICY "Staff can manage attachments"
--   ON attachments
--   USING (
--     auth.jwt() ->> 'role' IN ('admin', 'inventory_manager', 'warehouse_staff')
--   );

-- -- Create function to update updated_at timestamp
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = now();
--     RETURN NEW;
-- END;
-- $$ language 'plpgsql';

-- -- Create trigger for items table
-- CREATE TRIGGER update_items_updated_at
--     BEFORE UPDATE ON items
--     FOR EACH ROW
--     EXECUTE FUNCTION update_updated_at_column();