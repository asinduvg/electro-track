-- Seed data for ElectroTrack inventory management system

-- Insert sample locations
DO
$$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM locations WHERE unit = 'Shelf A1') THEN
            INSERT INTO locations (building, room, unit) VALUES ('Main Warehouse', 'Storage Room A', 'Shelf A1');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM locations WHERE unit = 'Shelf A2') THEN
            INSERT INTO locations (building, room, unit) VALUES ('Main Warehouse', 'Storage Room A', 'Shelf A2');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM locations WHERE unit = 'Bin B1') THEN
            INSERT INTO locations (building, room, unit) VALUES ('Main Warehouse', 'Storage Room B', 'Bin B1');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM locations WHERE unit = 'Cabinet C1') THEN
            INSERT INTO locations (building, room, unit) VALUES ('Engineering Department', 'Lab 1', 'Cabinet C1');
        END IF;
    END
$$;

-- Insert sample items
DO
$$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM items WHERE sku = 'IC-001') THEN
            INSERT INTO items (sku, name, description, category, subcategory, manufacturer, model, minimum_stock,
                               unit_cost, status)
            VALUES ('IC-001', 'ATmega328P Microcontroller', '8-bit AVR microcontroller with 32KB flash memory',
                    'Integrated Circuits', 'Microcontrollers', 'Microchip', 'ATmega328P-PU', 50, 2.95, 'in_stock');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM items WHERE sku = 'RES-001') THEN
            INSERT INTO items (sku, name, description, category, subcategory, manufacturer, model, minimum_stock,
                               unit_cost, status)
            VALUES ('RES-001', '10K Ohm Resistor', '1/4W 5% tolerance through-hole resistor', 'Passive Components',
                    'Resistors', 'Yageo', null, 500, 0.02, 'in_stock');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM items WHERE sku = 'CAP-001') THEN
            INSERT INTO items (sku, name, description, category, subcategory, manufacturer, model, minimum_stock,
                               unit_cost, status)
            VALUES ('CAP-001', '10uF Electrolytic Capacitor', '10uF 25V radial electrolytic capacitor',
                    'Passive Components', 'Capacitors', 'Nichicon', null, 300, 0.15, 'in_stock');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM items WHERE sku = 'LED-001') THEN
            INSERT INTO items (sku, name, description, category, subcategory, manufacturer, model, minimum_stock,
                               unit_cost, status)
            VALUES ('LED-001', '5mm Red LED', '5mm red LED, 20mA forward current', 'Optoelectronics', 'LEDs', 'Lite-On',
                    null, 500, 0.05, 'in_stock');
        END IF;
    END
$$;

-- Link items to locations with quantities
DO
$$
    DECLARE
        item_id_val     UUID;
        location_id_val UUID;
        item_sku        TEXT;
        qty             INTEGER;
    BEGIN
        -- Process each item
        FOR item_sku, qty IN
            VALUES ('IC-001', 150),
                   ('RES-001', 2500),
                   ('CAP-001', 1200),
                   ('LED-001', 3000)
            LOOP
                -- Get the item ID
                SELECT id INTO item_id_val FROM items WHERE sku = item_sku;

                -- Get a location ID (Shelf A1)
                SELECT id INTO location_id_val FROM locations WHERE unit = 'Shelf A1';

                -- Insert item_location if it doesn't exist
                IF NOT EXISTS (SELECT 1
                               FROM item_locations
                               WHERE item_id = item_id_val
                                 AND location_id = location_id_val) THEN
                    INSERT INTO item_locations (item_id, location_id, quantity, status)
                    VALUES (item_id_val, location_id_val, qty, 'in_stock');
                END IF;
            END LOOP;
    END
$$;