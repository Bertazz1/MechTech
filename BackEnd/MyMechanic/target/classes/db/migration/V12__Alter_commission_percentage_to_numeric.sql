-- Altera o tipo da coluna commission_percentage para NUMERIC para suportar valores decimais.
ALTER TABLE service_order_employees
ALTER COLUMN commission_percentage TYPE NUMERIC(5, 2);
