/*
  # Add Demo Users

  1. Changes
    - Add demo users for testing:
      - Admin user
      - Inventory Manager
      - Warehouse Staff
      - Department User

  2. Security
    - Users are created with proper roles and departments
*/

-- INSERT INTO users (id, email, role, name, department)
-- VALUES
--   (
--     gen_random_uuid(),
--     'vegain@example.com',
--     'admin',
--     'Admin User',
--     NULL
--   ),
--   (
--     gen_random_uuid(),
--     'inventory@example.com',
--     'inventory_manager',
--     'Inventory Manager',
--     'Operations'
--   ),
--   (
--     gen_random_uuid(),
--     'warehouse@example.com',
--     'warehouse_staff',
--     'Warehouse Staff',
--     'Warehouse'
--   ),
--   (
--     gen_random_uuid(),
--     'department@example.com',
--     'department_user',
--     'Department User',
--     'Engineering'
--   )
-- ON CONFLICT (email) DO NOTHING;