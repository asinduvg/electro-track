-- Seed public.users table from existing auth.users
-- This script matches the auth users in the screenshot to create corresponding public users

-- Admin user
INSERT INTO public.users (id, email, name, role, department, created_at, updated_at)
SELECT 'aac04f54-2d30-4155-8efa-050ce9020f0f'::uuid,
       'admin@et.com',
       'Admin User',
       'admin'::user_role,
       NULL,
       now(),
       now()
WHERE NOT EXISTS (SELECT 1
                  FROM public.users
                  WHERE id = 'aac04f54-2d30-4155-8efa-050ce9020f0f'::uuid
                     OR email = 'admin@et.com');

-- Inventory Manager user
INSERT INTO public.users (id, email, name, role, department, created_at, updated_at)
SELECT '577310b7-4c40-403f-be20-78b632987c24'::uuid,
       'im@et.com',
       'Inventory Manager',
       'inventory_manager'::user_role,
       'Operations',
       now(),
       now()
WHERE NOT EXISTS (SELECT 1
                  FROM public.users
                  WHERE id = '577310b7-4c40-403f-be20-78b632987c24'::uuid
                     OR email = 'im@et.com');

-- Warehouse Staff user
INSERT INTO public.users (id, email, name, role, department, created_at, updated_at)
SELECT 'b5345567-073a-4080-adff-87ee9e696c70'::uuid,
       'ws@et.com',
       'Warehouse Staff',
       'warehouse_staff'::user_role,
       'Warehouse',
       now(),
       now()
WHERE NOT EXISTS (SELECT 1
                  FROM public.users
                  WHERE id = 'b5345567-073a-4080-adff-87ee9e696c70'::uuid
                     OR email = 'ws@et.com');

-- Department User
INSERT INTO public.users (id, email, name, role, department, created_at, updated_at)
SELECT '4425abd8-3eef-42e4-89c6-24b574717590'::uuid,
       'du@et.com',
       'Department User',
       'department_user'::user_role,
       'Engineering',
       now(),
       now()
WHERE NOT EXISTS (SELECT 1
                  FROM public.users
                  WHERE id = '4425abd8-3eef-42e4-89c6-24b574717590'::uuid
                     OR email = 'du@et.com');