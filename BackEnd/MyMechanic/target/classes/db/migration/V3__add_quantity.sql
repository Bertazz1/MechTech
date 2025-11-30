-- Adicionar coluna quantity na tabela de itens de serviço da cotação
ALTER TABLE quotation_service_items ADD COLUMN quantity INT;

-- Atualizar registros existentes para ter quantidade 1 (para não quebrar constraints)
UPDATE quotation_service_items SET quantity = 1 WHERE quantity IS NULL;

-- Tornar a coluna obrigatória
ALTER TABLE quotation_service_items ALTER COLUMN quantity SET NOT NULL;