-- Create users table
CREATE TABLE IF NOT EXISTS users
(
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email      TEXT UNIQUE NOT NULL,
    role       user_role   NOT NULL,
    name       TEXT        NOT NULL,
    department TEXT,
    created_at TIMESTAMPTZ      DEFAULT now(),
    updated_at TIMESTAMPTZ      DEFAULT now(),
    created_by UUID,
    updated_by UUID,
    last_login TIMESTAMPTZ
);

-- Create locations table
CREATE TABLE IF NOT EXISTS locations
(
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    building   TEXT,
    room       TEXT,
    unit       TEXT NOT NULL,
    created_at TIMESTAMPTZ      DEFAULT now(),
    updated_at TIMESTAMPTZ      DEFAULT now(),
    created_by UUID REFERENCES users (id),
    updated_by UUID REFERENCES users (id)
);

-- Create items table
CREATE TABLE IF NOT EXISTS items
(
    id            UUID PRIMARY KEY        DEFAULT uuid_generate_v4(),
    sku           TEXT UNIQUE    NOT NULL,
    name          TEXT           NOT NULL,
    description   TEXT,
    category      TEXT           NOT NULL,
    subcategory   TEXT,
    manufacturer  TEXT           NOT NULL,
    model         TEXT,
    serial_number TEXT,
    minimum_stock INTEGER,
    unit_cost     NUMERIC(10, 2) NOT NULL,
    status        item_status    NOT NULL DEFAULT 'in_stock',
    created_at    TIMESTAMPTZ             DEFAULT now(),
    updated_at    TIMESTAMPTZ             DEFAULT now(),
    created_by    UUID REFERENCES users (id),
    updated_by    UUID REFERENCES users (id)
);

-- Create item_locations junction table
CREATE TABLE IF NOT EXISTS item_locations
(
    id                  UUID PRIMARY KEY     DEFAULT uuid_generate_v4(),
    item_id             UUID    NOT NULL REFERENCES items (id) ON DELETE CASCADE,
    location_id         UUID    NOT NULL REFERENCES locations (id) ON DELETE CASCADE,
    quantity            INTEGER NOT NULL     DEFAULT 0,
    purchased_date      TIMESTAMPTZ,
    warranty_expiration TIMESTAMPTZ,
    is_paid             BOOLEAN              DEFAULT true,
    status              item_location_status DEFAULT 'in_stock',
    created_at          TIMESTAMPTZ          DEFAULT now(),
    updated_at          TIMESTAMPTZ          DEFAULT now(),
    created_by          UUID REFERENCES users (id),
    updated_by          UUID REFERENCES users (id)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions
(
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type             transaction_type           NOT NULL,
    item_id          UUID                       NOT NULL REFERENCES items (id) ON DELETE CASCADE,
    quantity         INTEGER                    NOT NULL,
    from_location_id UUID REFERENCES locations (id),
    to_location_id   UUID REFERENCES locations (id),
    performed_by     UUID REFERENCES users (id) NOT NULL,
    performed_at     TIMESTAMPTZ      DEFAULT now(),
    notes            TEXT,
    project_id       TEXT,
    purpose          TEXT,
    metadata         JSONB
);

-- Create attachments table
CREATE TABLE IF NOT EXISTS attachments
(
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id     UUID                       NOT NULL REFERENCES items (id) ON DELETE CASCADE,
    name        TEXT                       NOT NULL,
    type        TEXT                       NOT NULL,
    url         TEXT                       NOT NULL,
    uploaded_by UUID REFERENCES users (id) NOT NULL,
    uploaded_at TIMESTAMPTZ      DEFAULT now()
);