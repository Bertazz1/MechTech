alter table clients
    RENAME COLUMN cpf TO cpfCnpj;
alter table clients
    ALTER COLUMN cpfCnpj TYPE VARCHAR(14);
alter table clients
    ALTER COLUMN cpfCnpj SET NOT NULL;

