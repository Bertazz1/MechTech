-- Recreate tenant_id columns with the correct type and add foreign key constraints

-- Clients
ALTER TABLE clients DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE clients ADD COLUMN tenant_id BIGINT;
ALTER TABLE clients ADD CONSTRAINT fk_clients_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Employee
ALTER TABLE employee DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE employee ADD COLUMN tenant_id BIGINT;
ALTER TABLE employee ADD CONSTRAINT fk_employee_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Quotations
ALTER TABLE quotations DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE quotations ADD COLUMN tenant_id BIGINT;
ALTER TABLE quotations ADD CONSTRAINT fk_quotations_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Vehicle Brands
ALTER TABLE vehicle_brands DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE vehicle_brands ADD COLUMN tenant_id BIGINT;
ALTER TABLE vehicle_brands ADD CONSTRAINT fk_vehicle_brands_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Vehicle Models
ALTER TABLE vehicle_models DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE vehicle_models ADD COLUMN tenant_id BIGINT;
ALTER TABLE vehicle_models ADD CONSTRAINT fk_vehicle_models_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Part
ALTER TABLE part DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE part ADD COLUMN tenant_id BIGINT;
ALTER TABLE part ADD CONSTRAINT fk_part_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Service Order
ALTER TABLE service_order DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE service_order ADD COLUMN tenant_id BIGINT;
ALTER TABLE service_order ADD CONSTRAINT fk_service_order_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Invoice
ALTER TABLE invoice DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE invoice ADD COLUMN tenant_id BIGINT;
ALTER TABLE invoice ADD CONSTRAINT fk_invoice_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Repair Service
ALTER TABLE repair_service DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE repair_service ADD COLUMN tenant_id BIGINT;
ALTER TABLE repair_service ADD CONSTRAINT fk_repair_service_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Users
-- A tabela users já foi ajustada para ter tenant_id opcional em V19, então não precisa de alterações aqui.

-- Roles
ALTER TABLE roles DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE roles ADD COLUMN tenant_id BIGINT;
ALTER TABLE roles ADD CONSTRAINT fk_roles_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Vehicles
ALTER TABLE vehicles DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE vehicles ADD COLUMN tenant_id BIGINT;
ALTER TABLE vehicles ADD CONSTRAINT fk_vehicles_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);
