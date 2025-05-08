-- Seed data for ElectroTrack inventory management system

-- Create demo users in auth.users table first
-- We need to insert directly into auth.users to create authentication accounts
INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at, email_confirmed_at)
VALUES
    -- Admin user
    (uuid_generate_v4(),
     'admin@et.com',
     '{"name": "Admin User", "role": "admin"}',
     now(),
     now(),
     now()),
    -- Inventory Manager user
    (uuid_generate_v4(),
     'im@et.com',
     '{"name": "Inventory Manager", "role": "inventory_manager", "department": "Operations"}',
     now(),
     now(),
     now()),
    -- Warehouse Staff user
    (uuid_generate_v4(),
     'ws@et.com',
     '{"name": "Warehouse Staff", "role": "warehouse_staff", "department": "Warehouse"}',
     now(),
     now(),
     now()),
    -- Department User
    (uuid_generate_v4(),
     'du@et.com',
     '{"name": "Department User", "role": "department_user", "department": "Engineering"}',
     now(),
     now(),
     now())
ON CONFLICT (email) DO NOTHING;

-- Set passwords for the users
-- This sets the password to 'pw@et' for all users
UPDATE auth.users
SET encrypted_password = crypt('pw@et', gen_salt('bf'))
WHERE email IN ('admin@et.com', 'im@et.com', 'ws@et.com', 'du@et.com');

-- Now create corresponding entries in public.users table
-- Get the IDs from auth.users and use them to create entries in public.users
INSERT INTO public.users (id, email, name, role, department, created_at)
SELECT id,
       email,
       (raw_user_meta_data ->> 'name')::text,
       (raw_user_meta_data ->> 'role')::user_role,
       (raw_user_meta_data ->> 'department')::text,
       created_at
FROM auth.users
WHERE email IN ('admin@et.com', 'im@et.com', 'ws@et.com', 'du@et.com')
ON CONFLICT (email) DO NOTHING;

-- Insert sample locations
INSERT INTO locations (building, room, unit)
VALUES ('Main Warehouse', 'Storage Room A', 'Shelf A1'),
       ('Main Warehouse', 'Storage Room A', 'Shelf A2'),
       ('Main Warehouse', 'Storage Room B', 'Bin B1'),
       ('Engineering Department', 'Lab 1', 'Cabinet C1')
ON CONFLICT DO NOTHING;

-- Insert sample items
INSERT INTO items (sku, name, description, category, subcategory, manufacturer, model, minimum_stock, unit_cost, status)
VALUES ('IC-001', 'ATmega328P Microcontroller', '8-bit AVR microcontroller with 32KB flash memory',
        'Integrated Circuits', 'Microcontrollers', 'Microchip', 'ATmega328P-PU', 50, 2.95, 'in_stock'),
       ('RES-001', '10K Ohm Resistor', '1/4W 5% tolerance through-hole resistor', 'Passive Components', 'Resistors',
        'Yageo', null, 500, 0.02, 'in_stock'),
       ('CAP-001', '10uF Electrolytic Capacitor', '10uF 25V radial electrolytic capacitor', 'Passive Components',
        'Capacitors', 'Nichicon', null, 300, 0.15, 'in_stock'),
       ('LED-001', '5mm Red LED', '5mm red LED, 20mA forward current', 'Optoelectronics', 'LEDs', 'Lite-On', null, 500,
        0.05, 'in_stock')
ON CONFLICT (sku) DO NOTHING;

-- Get the admin user ID to use as creator for initial records
DO
$$
    DECLARE
        admin_id UUID;
    BEGIN
        SELECT id INTO admin_id FROM public.users WHERE email = 'admin@et.com' LIMIT 1;

        -- Update created_by for items
        UPDATE items SET created_by = admin_id WHERE created_by IS NULL;

        -- Update created_by for locations
        UPDATE locations SET created_by = admin_id WHERE created_by IS NULL;
    END
$$;

-- Link items to locations with quantities
INSERT INTO item_locations (item_id, location_id, quantity, status)
SELECT i.id       AS item_id,
       l.id       AS location_id,
       CASE
           WHEN i.sku = 'IC-001' THEN 150
           WHEN i.sku = 'RES-001' THEN 2500
           WHEN i.sku = 'CAP-001' THEN 1200
           WHEN i.sku = 'LED-001' THEN 3000
           ELSE 100
           END    AS quantity,
       'in_stock' AS status
FROM items i
         CROSS JOIN locations l
WHERE i.sku IN ('IC-001', 'RES-001', 'CAP-001', 'LED-001')
  AND l.unit IN ('Shelf A1', 'Shelf A2')
  AND NOT EXISTS (SELECT 1
                  FROM item_locations
                  WHERE item_id = i.id
                    AND location_id = l.id)
LIMIT 4;

-- Update total quantities in items table based on item_locations
UPDATE items i
SET quantity = subquery.total_quantity
FROM (SELECT item_id, SUM(quantity) as total_quantity
      FROM item_locations
      GROUP BY item_id) AS subquery
WHERE i.id = subquery.item_id;