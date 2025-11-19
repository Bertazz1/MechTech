# MyMechanic

O **MyMechanic** é uma API RESTful robusta desenvolvida com Spring Boot para a gestão completa de oficinas mecânicas. O sistema utiliza uma arquitetura **Multi-Tenant**, permitindo que múltiplas oficinas utilizem a mesma aplicação com isolamento total dos seus dados.

## 🚀 Tecnologias Utilizadas

O projeto foi construído utilizando as seguintes tecnologias e bibliotecas principais:

* **Java 21**
* **Spring Boot 3.5.3**
* **Spring Data JPA** & **Hibernate**: Persistência de dados e ORM.
* **Spring Security**: Autenticação e controlo de acesso.
* **JWT (JSON Web Token)**: Segurança stateless com tokens assinados.
* **PostgreSQL**: Banco de dados relacional para produção.
* **H2 Database**: Banco de dados em memória para testes de integração.
* **Flyway**: Versionamento e migração de banco de dados.
* **OpenPDF (LibrePDF)**: Geração de documentos PDF (Orçamentos, Ordens de Serviço e Faturas).
* **SpringDoc OpenAPI (Swagger)**: Documentação interativa da API.
* **Maven**: Gestão de dependências e build.

## ⚙️ Funcionalidades Principais

### 🏢 Multi-Tenancy
A aplicação implementa isolamento lógico de dados. Cada requisição autenticada carrega um contexto de "Tenant" (Oficina), garantindo que os utilizadores acedam apenas aos dados da sua própria organização.

### 🛠️ Gestão Operacional
* **Clientes e Veículos**: Cadastro completo com validação de CPF e integração para endereços.
* **Orçamentos (Quotations)**: Criação de propostas com peças e mão de obra.
* **Ordens de Serviço (Service Orders)**: Conversão de orçamentos em OS, controlo de status e alocação de funcionários.
* **Faturação (Invoices)**: Geração automática de faturas a partir de OS concluídas.
* **Estoque (Parts)**: Gestão de peças e fornecedores.

### 📄 Geração de PDF
Endpoints dedicados para download de documentos PDF gerados dinamicamente:
* `/api/v1/quotations/{id}/pdf`
* `/api/v1/service-orders/{id}/pdf`
* `/api/v1/invoices/{id}/pdf`

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:
* **JDK 21**
* **PostgreSQL** (a rodar na porta 5432)

## 🚀 Como Rodar o Projeto

### 1. Configuração do Banco de Dados
Crie um banco de dados no PostgreSQL chamado `mechtech`:
```sql
CREATE DATABASE mechtech;
