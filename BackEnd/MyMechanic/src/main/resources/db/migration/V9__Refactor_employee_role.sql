-- Adiciona a nova coluna para a chave estrangeira da role
ALTER TABLE employees ADD COLUMN role_id BIGINT;

-- Adiciona a restrição de chave estrangeira
ALTER TABLE employees ADD CONSTRAINT fk_employees_role FOREIGN KEY (role_id) REFERENCES roles(id);

-- Remove a coluna de texto antiga 'role'
ALTER TABLE employees DROP COLUMN role;
