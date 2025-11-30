
-- Adiciona a coluna quantity na tabela de itens de serviço da Ordem de Serviço
ALTER TABLE service_order_service_items ADD COLUMN quantity INT;

-- Define valor padrão 1 para registros existentes para evitar erro de NULL
UPDATE service_order_service_items SET quantity = 1 WHERE quantity IS NULL;

-- Torna a coluna obrigatória (NOT NULL) e define um valor padrão para novas inserções
ALTER TABLE service_order_service_items ALTER COLUMN quantity SET NOT NULL;