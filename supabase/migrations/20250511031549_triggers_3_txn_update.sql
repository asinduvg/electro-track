-- Modified trigger function to run BEFORE INSERT
CREATE OR REPLACE FUNCTION validate_and_prepare_transaction()
    RETURNS TRIGGER AS
$$
BEGIN
    -- Handle different transaction types
    CASE NEW.type
        WHEN 'receive' THEN
        -- No validation needed for receive, we're adding inventory

        WHEN 'withdraw' THEN -- Check if the item exists at the from_location
        IF NOT EXISTS (SELECT 1
                       FROM item_locations
                       WHERE item_id = NEW.item_id
                         AND location_id = NEW.from_location_id) THEN
            RAISE EXCEPTION 'Item % does not exist at location %',
                NEW.item_id, NEW.from_location_id;
        END IF;

        -- Validate withdrawal doesn't exceed available quantity
        IF (SELECT quantity
            FROM item_locations
            WHERE item_id = NEW.item_id
              AND location_id = NEW.from_location_id) < NEW.quantity THEN
            RAISE EXCEPTION 'Cannot withdraw more than available quantity (%) for item %',
                (SELECT quantity
                 FROM item_locations
                 WHERE item_id = NEW.item_id
                   AND location_id = NEW.from_location_id),
                NEW.item_id;
        END IF;

        WHEN 'transfer' THEN -- First check if the item exists at the from_location
        IF NOT EXISTS (SELECT 1
                       FROM item_locations
                       WHERE item_id = NEW.item_id
                         AND location_id = NEW.from_location_id) THEN
            RAISE EXCEPTION 'Item % does not exist at location %',
                NEW.item_id, NEW.from_location_id;
        END IF;

        -- Then validate transfer doesn't exceed available quantity
        IF (SELECT quantity
            FROM item_locations
            WHERE item_id = NEW.item_id
              AND location_id = NEW.from_location_id) < NEW.quantity THEN
            RAISE EXCEPTION 'Cannot transfer more than available quantity (%) for item %',
                (SELECT quantity
                 FROM item_locations
                 WHERE item_id = NEW.item_id
                   AND location_id = NEW.from_location_id),
                NEW.item_id;
        END IF;

        WHEN 'dispose' THEN -- Check if the item exists at the from_location
        IF NOT EXISTS (SELECT 1
                       FROM item_locations
                       WHERE item_id = NEW.item_id
                         AND location_id = NEW.from_location_id) THEN
            RAISE EXCEPTION 'Item % does not exist at location %',
                NEW.item_id, NEW.from_location_id;
        END IF;

        -- Validate disposal doesn't exceed available quantity
        IF (SELECT quantity
            FROM item_locations
            WHERE item_id = NEW.item_id
              AND location_id = NEW.from_location_id) < NEW.quantity THEN
            RAISE EXCEPTION 'Cannot dispose more than available quantity (%) for item %',
                (SELECT quantity
                 FROM item_locations
                 WHERE item_id = NEW.item_id
                   AND location_id = NEW.from_location_id),
                NEW.item_id;
        END IF;

        WHEN 'adjust' THEN -- If removing inventory, check if the item exists at the location
        IF NEW.from_location_id IS NOT NULL AND NEW.to_location_id IS NULL THEN
            IF NOT EXISTS (SELECT 1
                           FROM item_locations
                           WHERE item_id = NEW.item_id
                             AND location_id = NEW.from_location_id) THEN
                RAISE EXCEPTION 'Item % does not exist at location %',
                    NEW.item_id, NEW.from_location_id;
            END IF;

            -- Validate adjustment doesn't exceed available quantity
            IF (SELECT quantity
                FROM item_locations
                WHERE item_id = NEW.item_id
                  AND location_id = NEW.from_location_id) < NEW.quantity THEN
                RAISE EXCEPTION 'Cannot adjust to below zero quantity for item %', NEW.item_id;
            END IF;
        END IF;
        END CASE;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS before_transaction_insert ON transactions;

-- BEFORE INSERT trigger for validation
CREATE TRIGGER before_transaction_insert
    BEFORE INSERT
    ON transactions
    FOR EACH ROW
EXECUTE FUNCTION validate_and_prepare_transaction();

-- AFTER INSERT trigger for actual updates
CREATE OR REPLACE FUNCTION update_inventory_after_transaction()
    RETURNS TRIGGER AS
$$
BEGIN
    -- Handle different transaction types
    CASE NEW.type
        WHEN 'receive' THEN -- Check if item exists at destination location
        IF EXISTS (SELECT 1
                   FROM item_locations
                   WHERE item_id = NEW.item_id
                     AND location_id = NEW.to_location_id) THEN
            -- Update existing record
            UPDATE item_locations
            SET quantity = quantity + NEW.quantity
            WHERE item_id = NEW.item_id
              AND location_id = NEW.to_location_id;
        ELSE
            -- Create new record
            INSERT INTO item_locations (item_id, location_id, quantity)
            VALUES (NEW.item_id, NEW.to_location_id, NEW.quantity);
        END IF;

        WHEN 'withdraw' THEN -- Decrease quantity from from_location
        UPDATE item_locations
        SET quantity = quantity - NEW.quantity
        WHERE item_id = NEW.item_id
          AND location_id = NEW.from_location_id;

        WHEN 'transfer' THEN -- Subtract from source location
        UPDATE item_locations
        SET quantity = quantity - NEW.quantity
        WHERE item_id = NEW.item_id
          AND location_id = NEW.from_location_id;

        -- Check specifically if destination location exists
        IF EXISTS (SELECT 1
                   FROM item_locations
                   WHERE item_id = NEW.item_id
                     AND location_id = NEW.to_location_id) THEN
            -- Update existing destination
            UPDATE item_locations
            SET quantity = quantity + NEW.quantity
            WHERE item_id = NEW.item_id
              AND location_id = NEW.to_location_id;
        ELSE
            -- Insert new destination record
            INSERT INTO item_locations (item_id, location_id, quantity)
            VALUES (NEW.item_id, NEW.to_location_id, NEW.quantity);
        END IF;

        WHEN 'dispose' THEN -- Decrease quantity from from_location
        UPDATE item_locations
        SET quantity = quantity - NEW.quantity
        WHERE item_id = NEW.item_id
          AND location_id = NEW.from_location_id;

        WHEN 'adjust' THEN -- If adding inventory (to_location_id is not null)
        IF NEW.from_location_id IS NULL AND NEW.to_location_id IS NOT NULL THEN
            -- Check if destination exists
            IF EXISTS (SELECT 1
                       FROM item_locations
                       WHERE item_id = NEW.item_id
                         AND location_id = NEW.to_location_id) THEN
                -- Update existing location
                UPDATE item_locations
                SET quantity = quantity + NEW.quantity
                WHERE item_id = NEW.item_id
                  AND location_id = NEW.to_location_id;
            ELSE
                -- Create new location record
                INSERT INTO item_locations (item_id, location_id, quantity)
                VALUES (NEW.item_id, NEW.to_location_id, NEW.quantity);
            END IF;
            -- If removing inventory (from_location_id is not null)
        ELSIF NEW.from_location_id IS NOT NULL AND NEW.to_location_id IS NULL THEN
            -- Removing inventory (already validated it exists)
            UPDATE item_locations
            SET quantity = quantity - NEW.quantity
            WHERE item_id = NEW.item_id
              AND location_id = NEW.from_location_id;
        END IF;
        END CASE;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_transaction_insert ON transactions;

-- AFTER INSERT trigger for updates
CREATE TRIGGER after_transaction_insert
    AFTER INSERT
    ON transactions
    FOR EACH ROW
EXECUTE FUNCTION update_inventory_after_transaction();