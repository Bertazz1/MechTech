-- Tabela de Cargos
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    receives_commission BOOLEAN DEFAULT FALSE,

    -- Campos padrão
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN DEFAULT FALSE NOT NULL,
    tenant_id VARCHAR(255)
);


ALTER TABLE employee ADD COLUMN role_id BIGINT;



ALTER TABLE employee ADD CONSTRAINT fk_employee_role FOREIGN KEY (role_id) REFERENCES roles(id);

 ALTER TABLE employee DROP COLUMN role;