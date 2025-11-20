# MyMechanic

O **MyMechanic** é uma API RESTful robusta desenvolvida com Spring Boot para a gestão completa de oficinas mecânicas. O sistema utiliza uma arquitetura **Multi-Tenant**, permitindo que múltiplas oficinas utilizem a mesma aplicação com isolamento total dos seus dados.

##  Tecnologias Utilizadas

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

##  Funcionalidades Principais

###  Multi-Tenancy
A aplicação implementa isolamento lógico de dados. Cada requisição autenticada carrega um contexto de "Tenant" (Oficina), garantindo que os utilizadores acedam apenas aos dados da sua própria organização.

###  Gestão Operacional
* **Clientes e Veículos**: Cadastro completo com validação de CPF e integração para endereços.
* **Orçamentos (Quotations)**: Criação de propostas com peças e mão de obra.
* **Ordens de Serviço (Service Orders)**: Conversão de orçamentos em OS, controlo de status e alocação de funcionários.
* **Faturação (Invoices)**: Geração automática de faturas a partir de OS concluídas.
* **Peças (Parts)**: Gestão de peças e fornecedores.

###  Geração de PDF
Endpoints dedicados para download de documentos PDF gerados dinamicamente:
* `/api/v1/quotations/{id}/pdf`
* `/api/v1/service-orders/{id}/pdf`
* `/api/v1/invoices/{id}/pdf`

##  Pré-requisitos

Antes de começar, certifique-se de ter instalado:
* **JDK 21**
* **PostgreSQL** (a rodar na porta 5432)

##  Como Rodar o Projeto

###  Configuração do Banco de Dados
Crie um banco de dados no PostgreSQL chamado `mechtech`:
```sql
CREATE DATABASE mechtech;\
```
###  Executar o BackEnd (API)
Abra um terminal e navegue até à pasta do servidor:

```
cd BackEnd/MyMechanic
```
Execute a aplicação usando o Maven Wrapper:

Linux/Mac: ```./mvnw spring-boot:run```

Windows: ```mvnw.cmd spring-boot:run```

A API iniciará na porta 8080. As tabelas serão criadas automaticamente na primeira execução.

```Documentação Swagger: http://localhost:8080/swagger-ui.html```

###  Executar o FrontEnd (Web)
Abra outro terminal (mantenha o BackEnd a rodar) e navegue até à pasta do frontend:


```
cd frontend
```
###  Instale as dependências do projeto:

```
npm install
```
###  Inicie o servidor de desenvolvimento:

```
npm run serve
```

O FrontEnd ficará disponível (geralmente) em http://localhost:8081 ou http://localhost:3000 (verifique o output no terminal).

###  Acesso e Primeiros Passos
Aceda ao endereço do FrontEnd no seu navegador.

Registo: Se não tiver utilizadores criados, vá à página de Registo (/register) para criar uma conta. O primeiro utilizador será automaticamente um Administrador do seu Tenant.

Login: Utilize as credenciais criadas para entrar no Dashboard.

### Estrutura do Projeto
```
/
├── BackEnd/
│   └── MyMechanic/      # Código Fonte da API (Spring Boot)
│       ├── src/main/java.../controller  # Endpoints da API
│       ├── src/main/java.../entity      # Modelo de Dados
│       └── pom.xml                      # Dependências Maven
│
└── frontend/            # Código Fonte da Interface (Vue.js)
    ├── public/          # Ficheiros estáticos (index.html)
    ├── src/
    │   ├── components/  # Componentes Reutilizáveis (Cards, Inputs)
    │   ├── pages/       # Páginas da Aplicação (Dashboard, Login)
    │   ├── services/    # Comunicação com a API (Axios)
    │   └── routes/      # Definição de rotas
    └── package.json     # Dependências NPM
```
 Executar Testes
BackEnd: Na pasta BackEnd/MyMechanic, execute ./mvnw test. Isto rodará os testes de integração usando uma base de dados em memória H2.
