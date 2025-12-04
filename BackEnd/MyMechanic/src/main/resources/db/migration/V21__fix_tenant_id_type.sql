ALTER TABLE users
    ALTER COLUMN tenant_id TYPE BIGINT USING tenant_id::bigint,
    ADD CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);