CREATE TABLE roles(
    id UUID PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL DEFAULT 'EMPLOYEE' CHECK (
        name IN (
            'EMPLOYEE','REVIEWER','MANAGER','ADMIN'
        )
    ),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);