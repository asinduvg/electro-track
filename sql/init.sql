-- Create the database
CREATE DATABASE neondb;

\c neondb;

-- ENUM Types
CREATE TYPE activity_type AS ENUM ('login', 'logout', 'create', 'update', 'delete', 'view', 'export', 'import');
CREATE TYPE alert_status AS ENUM ('active', 'acknowledged', 'resolved');
CREATE TYPE alert_type AS ENUM ('low_stock', 'expiring', 'out_of_stock', 'overstock');
CREATE TYPE item_location_status AS ENUM ('in_stock', 'ordered', 'reserved');
CREATE TYPE item_status AS ENUM ('in_stock', 'low_stock', 'out_of_stock', 'discontinued');
CREATE TYPE supplier_status AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE transaction_type AS ENUM ('receive', 'transfer', 'dispose', 'withdraw', 'adjust', 'reserve', 'unreserve');
CREATE TYPE user_role AS ENUM ('admin', 'inventory_manager', 'warehouse_staff', 'department_user');

-- TABLES

CREATE TABLE alerts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    type alert_type NOT NULL,
    status alert_status DEFAULT 'active' NOT NULL,
    item_id uuid,
    location_id uuid,
    title text NOT NULL,
    message text NOT NULL,
    threshold_value integer,
    current_value integer,
    created_at timestamp DEFAULT now(),
    acknowledged_at timestamp,
    acknowledged_by uuid,
    resolved_at timestamp
);

CREATE TABLE categories (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category text NOT NULL,
    subcategory text NOT NULL
);

CREATE TABLE category_hierarchy (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    parent_id uuid,
    description text,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

CREATE TABLE item_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id uuid NOT NULL,
    field_name text NOT NULL,
    old_value text,
    new_value text,
    changed_by uuid NOT NULL,
    changed_at timestamp DEFAULT now()
);

CREATE TABLE item_locations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id uuid NOT NULL,
    location_id uuid NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    purchased_date timestamp,
    warranty_expiration timestamp,
    is_paid boolean DEFAULT true,
    status item_location_status DEFAULT 'in_stock',
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now(),
    created_by uuid,
    updated_by uuid
);

CREATE TABLE items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sku text NOT NULL,
    name text NOT NULL,
    description text,
    manufacturer text NOT NULL,
    model text,
    serial_number text,
    minimum_stock integer,
    unit_cost numeric(10,2) NOT NULL,
    status item_status DEFAULT 'out_of_stock' NOT NULL,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    category_id bigint,
    image_url text,
    maximum_stock integer
);

CREATE TABLE locations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    building text,
    room text,
    unit text NOT NULL,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now(),
    created_by uuid,
    updated_by uuid
);

CREATE TABLE purchase_order_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    purchase_order_id uuid NOT NULL,
    item_id uuid NOT NULL,
    quantity integer NOT NULL,
    unit_cost numeric(10,2) NOT NULL,
    received_quantity integer DEFAULT 0
);

CREATE TABLE purchase_orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number text NOT NULL,
    supplier_id uuid NOT NULL,
    status text DEFAULT 'draft' NOT NULL,
    total_amount numeric(10,2),
    order_date timestamp DEFAULT now(),
    expected_delivery timestamp,
    actual_delivery timestamp,
    notes text,
    created_by uuid NOT NULL,
    created_at timestamp DEFAULT now()
);

CREATE TABLE saved_searches (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    name text NOT NULL,
    search_criteria text NOT NULL,
    created_at timestamp DEFAULT now()
);

CREATE TABLE stock_reservations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id uuid NOT NULL,
    location_id uuid NOT NULL,
    quantity integer NOT NULL,
    reserved_by uuid NOT NULL,
    reason text,
    expires_at timestamp,
    created_at timestamp DEFAULT now()
);

CREATE TABLE supplier_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id uuid NOT NULL,
    item_id uuid NOT NULL,
    supplier_sku text,
    unit_cost numeric(10,2),
    minimum_order_quantity integer,
    lead_time_days integer,
    is_preferred boolean DEFAULT false,
    created_at timestamp DEFAULT now()
);

CREATE TABLE suppliers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    contact_name text,
    email text,
    phone text,
    address text,
    website text,
    status supplier_status DEFAULT 'active' NOT NULL,
    rating integer,
    notes text,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

CREATE TABLE transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    type transaction_type NOT NULL,
    item_id uuid NOT NULL,
    quantity integer NOT NULL,
    from_location_id uuid,
    to_location_id uuid,
    performed_by uuid NOT NULL,
    performed_at timestamp DEFAULT now(),
    notes text,
    project_id text,
    purpose text
);

CREATE TABLE user_activity (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    activity_type activity_type NOT NULL,
    resource_type text,
    resource_id text,
    description text NOT NULL,
    ip_address text,
    user_agent text,
    created_at timestamp DEFAULT now()
);

CREATE TABLE users (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text NOT NULL,
    role user_role NOT NULL,
    name text NOT NULL,
    department text,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    last_login timestamp
);
