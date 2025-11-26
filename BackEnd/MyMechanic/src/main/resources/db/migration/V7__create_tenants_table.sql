CREATE TABLE tenants (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    document VARCHAR(20), -- CNPJ ou CPF
    email VARCHAR(255),
    phone VARCHAR(20),
    active BOOLEAN DEFAULT TRUE,

    logo BYTEA,
    logo_content_type VARCHAR(50),

    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);