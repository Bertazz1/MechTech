ALTER TABLE service_order_service_items ADD COLUMN employee_id BIGINT;
ALTER TABLE service_order_service_items ADD CONSTRAINT fk_service_item_employee FOREIGN KEY (employee_id) REFERENCES employee(id);

DROP TABLE IF EXISTS service_order_employees;