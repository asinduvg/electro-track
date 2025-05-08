-- Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_modtime
    BEFORE UPDATE
    ON users
    FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_locations_modtime
    BEFORE UPDATE
    ON locations
    FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_items_modtime
    BEFORE UPDATE
    ON items
    FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_item_locations_modtime
    BEFORE UPDATE
    ON item_locations
    FOR EACH ROW
EXECUTE FUNCTION update_modified_column();