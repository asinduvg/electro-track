-- Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_transaction_performed_at()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.performed_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_users_modtime ON users;

CREATE TRIGGER update_users_modtime
    BEFORE UPDATE
    ON users
    FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_locations_modtime ON locations;

CREATE TRIGGER update_locations_modtime
    BEFORE UPDATE
    ON locations
    FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_items_modtime ON items;

CREATE TRIGGER update_items_modtime
    BEFORE UPDATE
    ON items
    FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_item_locations_modtime ON item_locations;

CREATE TRIGGER update_item_locations_modtime
    BEFORE UPDATE
    ON item_locations
    FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_transactions_performed_at ON transactions;

-- Create the trigger for transactions table
CREATE TRIGGER update_transactions_performed_at
    BEFORE UPDATE
    ON transactions
    FOR EACH ROW
EXECUTE FUNCTION update_transaction_performed_at();