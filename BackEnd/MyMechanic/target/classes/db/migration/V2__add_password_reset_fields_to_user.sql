-- Flyway Migration V3__add_password_reset_fields_to_user.sql

-- Adiciona a coluna para armazenar o token de redefinição de senha
ALTER TABLE users
    ADD COLUMN password_reset_token VARCHAR(255);

-- Adiciona a coluna para a data de expiração do token
ALTER TABLE users
    ADD COLUMN password_reset_token_expires_at TIMESTAMP WITHOUT TIME ZONE;

-- Opcional: Adiciona um índice para busca rápida pelo token
CREATE INDEX idx_password_reset_token ON users (password_reset_token);