ALTER TABLE quotations ADD COLUMN status_temp VARCHAR(255);

UPDATE quotations SET status_temp =
  CASE
    WHEN status::text = '0' THEN 'AWAITING_CONVERSION'
    WHEN status::text = '1' THEN 'CONVERTED_TO_ORDER'
    WHEN status::text = '2' THEN 'CANCELED'
    ELSE status::text
  END;

ALTER TABLE quotations DROP COLUMN status;

ALTER TABLE quotations RENAME COLUMN status_temp TO status;
