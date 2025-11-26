ALTER TABLE tenants ADD COLUMN invite_token VARCHAR(36);
UPDATE tenants SET invite_token = gen_random_uuid()::text WHERE invite_token IS NULL;