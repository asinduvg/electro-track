-- Create policies for users table
CREATE POLICY "Users can view their own data"
    ON users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Admins and inventory managers can view all users"
    ON users
    FOR SELECT
    TO authenticated
    USING (is_admin() OR is_inventory_manager());

CREATE POLICY "Admins can manage users"
    ON users
    FOR ALL
    TO authenticated
    USING (is_admin());

-- Create policies for items table
CREATE POLICY "Everyone can view items"
    ON items
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins and inventory managers can manage items"
    ON items
    FOR ALL
    TO authenticated
    USING (is_admin() OR is_inventory_manager());

-- Create policies for locations table
CREATE POLICY "Everyone can view locations"
    ON locations
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins and inventory managers can manage locations"
    ON locations
    FOR ALL
    TO authenticated
    USING (is_admin() OR is_inventory_manager());

-- Create policies for item_locations table
CREATE POLICY "Everyone can view item_locations"
    ON item_locations
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins and inventory managers can manage item_locations"
    ON item_locations
    FOR ALL
    TO authenticated
    USING (is_admin() OR is_inventory_manager());

CREATE POLICY "Warehouse staff can update item_locations"
    ON item_locations
    FOR UPDATE
    TO authenticated
    USING (is_warehouse_staff());

-- Create policies for transactions table
CREATE POLICY "Everyone can view transactions"
    ON transactions
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Staff can create transactions"
    ON transactions
    FOR INSERT
    TO authenticated
    WITH CHECK (is_staff());

-- Create policies for attachments table
CREATE POLICY "Everyone can view attachments"
    ON attachments
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Staff can manage attachments"
    ON attachments
    FOR ALL
    TO authenticated
    USING (is_staff());