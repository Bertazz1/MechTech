alter table clients
    RENAME COLUMN cpfCnpj TO cpf_cnpj;
alter table clients
    ALTER COLUMN cpf_cnpj TYPE VARCHAR(14);
alter table clients
    ALTER COLUMN cpf_cnpj SET NOT NULL;

