-- Adiciona colunas de auditoria à tabela 'addresses'
ALTER TABLE addresses
ADD COLUMN created_at TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP,
ADD COLUMN created_by VARCHAR(255),
ADD COLUMN updated_by VARCHAR(255);
