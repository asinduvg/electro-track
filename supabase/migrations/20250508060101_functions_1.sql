-- Create utility function to check if user is an admin
CREATE OR REPLACE FUNCTION is_admin()
    RETURNS BOOLEAN AS
$$
BEGIN
    RETURN EXISTS (SELECT 1
                   FROM public.users
                   WHERE id = (select auth.uid())
                     AND role = 'admin'::user_role);
END;
$$ language plpgsql security definer;

-- Create similar utility functions for other roles
CREATE OR REPLACE FUNCTION is_inventory_manager()
    RETURNS BOOLEAN AS
$$
BEGIN
    RETURN EXISTS (SELECT 1
                   FROM public.users
                   WHERE id = (select auth.uid())
                     AND role = 'inventory_manager'::user_role);
END;
$$ language plpgsql security definer;

CREATE OR REPLACE FUNCTION is_warehouse_staff()
    RETURNS BOOLEAN AS
$$
BEGIN
    RETURN EXISTS (SELECT 1
                   FROM public.users
                   WHERE id = (select auth.uid())
                     AND role = 'warehouse_staff'::user_role);
END;
$$ language plpgsql security definer;

-- Function to check if user has staff privileges (admin, inventory manager, or warehouse staff)
CREATE OR REPLACE FUNCTION is_staff()
    RETURNS BOOLEAN AS
$$
BEGIN
    RETURN EXISTS (SELECT 1
                   FROM public.users
                   WHERE id = (select auth.uid())
                     AND role IN ('admin'::user_role, 'inventory_manager'::user_role, 'warehouse_staff'::user_role));
END;
$$ language plpgsql security definer;