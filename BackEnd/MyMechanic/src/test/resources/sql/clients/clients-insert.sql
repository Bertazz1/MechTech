insert into USERS (id, username, password, role, tenant_id) values (100, 'admin@tenant1.com', '$2a$12$d97TTYzpqnqslpMRRzAEGOI4JGy.fMR2jTVY4a/BD.FFZ8Ant.pX2', 'ROLE_ADMIN', 'tenant-1');
insert into USERS (id, username, password, role, tenant_id) values (101, 'maria@tenant1.com', '$2a$12$d97TTYzpqnqslpMRRzAEGOI4JGy.fMR2jTVY4a/BD.FFZ8Ant.pX2', 'ROLE_CLIENT', 'tenant-1');
insert into USERS (id, username, password, role, tenant_id) values (102, 'pedro@tenant2.com', '$2a$12$d97TTYzpqnqslpMRRzAEGOI4JGy.fMR2jTVY4a/BD.FFZ8Ant.pX2', 'ROLE_CLIENT', 'tenant-2');

insert into CLIENTS (id, name, email, phone, tenant_id) values (11, 'Maria Souza Tenant 1', 'maria@tenant1.com', '999639181', 'tenant-1');
insert into CLIENTS (id, name, email, phone, tenant_id) values (12, 'Pedro Oliveira Tenant 2', 'pedro@tenant2.com', '999231234', 'tenant-2');