CREATE OR REPLACE FUNCTION update_item_status()
    RETURNS TRIGGER AS
$$
DECLARE
    total_quantity INTEGER;
BEGIN
    -- Calculate the total quantity for the item
    SELECT COALESCE(SUM(quantity), 0)
    INTO total_quantity
    FROM item_locations
    WHERE item_id = NEW.item_id;

    -- Update the status based on the total quantity
    IF total_quantity = 0 THEN
        UPDATE items SET status = 'out_of_stock' WHERE id = NEW.item_id;
    ELSIF total_quantity < (SELECT minimum_stock FROM items WHERE id = NEW.item_id) THEN
        UPDATE items SET status = 'low_stock' WHERE id = NEW.item_id;
    ELSE
        UPDATE items SET status = 'in_stock' WHERE id = NEW.item_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS item_status_update ON item_locations;

CREATE TRIGGER item_status_update
    AFTER INSERT OR UPDATE OR DELETE
    ON item_locations
    FOR EACH ROW
EXECUTE FUNCTION update_item_status();

DROP TRIGGER IF EXISTS minimum_stock_update ON items;

CREATE TRIGGER minimum_stock_update
    AFTER UPDATE OF minimum_stock
    ON items
    FOR EACH ROW
EXECUTE FUNCTION update_item_status();