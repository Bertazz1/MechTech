# Sistema de Autenticação - Vue Material Dashboard

Este projeto foi estruturado para se conectar a uma API de autenticação. Aqui estão as informações sobre como o sistema funciona:

## Configuração da API

### Endpoint de Autenticação
- **URL**: `http://localhost:8080/api/v1/auth`
- **Método**: POST
- **Parâmetros**:
  ```json
  {
    "username": "seu_usuario",
    "password": "sua_senha"
  }
  ```
- **Resposta esperada**:
  ```json
  {
    "token": "Bearer_token_aqui",
    "user": {
      "id": 1,
      "username": "usuario",
      "email": "usuario@email.com"
    }
  }
  ```

## Arquivos Criados/Modificados

### 1. Serviços de API (`src/services/`)

#### `api.js`
- Configuração base do Axios
- Interceptors para adicionar token Bearer automaticamente
- Tratamento de erros 401 (token expirado)

#### `auth.js`
- Serviço de autenticação
- Métodos: `login()`, `logout()`, `isAuthenticated()`, `getToken()`, `getUser()`
- Gerenciamento do localStorage

#### `example-api.js`
- Exemplos de como usar a API em outros serviços
- Padrões para CRUD operations

### 2. Páginas Modificadas

#### `src/pages/Dashboard/Pages/Login.vue`
- Formulário de login funcional
- Campos: username e password
- Validação e feedback de erro
- Redirecionamento após login bem-sucedido

#### `src/pages/Dashboard/Layout/TopNavbar.vue`
- Botão de logout adicionado
- Funcionalidade de logout implementada

### 3. Roteamento (`src/routes/routes.js`)
- Guards de autenticação adicionados
- Meta `requiresAuth: true` em rotas protegidas
- Redirecionamento automático baseado no status de autenticação

### 4. Configuração Principal (`src/main.js`)
- Navigation guard global implementado
- Verificação de autenticação antes de cada rota

## Como Usar

### 1. Login
1. Acesse `/login`
2. Digite username e password
3. Clique em "Entrar"
4. Será redirecionado para `/dashboard` se o login for bem-sucedido

### 2. Logout
1. Clique no ícone de logout no navbar superior
2. Será redirecionado para `/login`

### 3. Proteção de Rotas
Todas as rotas do dashboard são protegidas. Se tentar acessar sem estar autenticado, será redirecionado para `/login`.

### 4. Usando a API em Componentes

```javascript
// Importar o serviço
import ExampleApiService from '@/services/example-api';

// Em um método do componente
async fetchData() {
  const result = await ExampleApiService.getUserData();
  if (result.success) {
    this.userData = result.data;
  } else {
    console.error(result.message);
  }
}
```

## Configuração do Backend

Para que o sistema funcione, seu backend deve:

1. **Endpoint de Login** (`POST /api/v1/auth`):
   - Aceitar `username` e `password`
   - Retornar um token JWT
   - Opcionalmente retornar dados do usuário

2. **Validação de Token**:
   - Verificar o header `Authorization: Bearer <token>`
   - Retornar 401 se o token for inválido/expirado

3. **CORS**:
   - Permitir requisições do frontend
   - Headers necessários: `Authorization`, `Content-Type`

## Exemplo de Configuração Backend (Node.js/Express)

```javascript
// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(401);
    req.user = user;
    next();
  });
};

// Rota de login
app.post('/api/v1/auth', (req, res) => {
  const { username, password } = req.body;
  
  // Validar credenciais
  if (isValidUser(username, password)) {
    const token = jwt.sign({ username }, process.env.ACCESS_TOKEN_SECRET);
    res.json({ 
      token,
      user: { username, email: 'user@example.com' }
    });
  } else {
    res.status(401).json({ message: 'Credenciais inválidas' });
  }
});

// Rotas protegidas
app.get('/api/v1/user', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});
```

## Testando

1. Inicie o projeto: `npm run serve`
2. Acesse `http://localhost:8080`
3. Será redirecionado para `/login`
4. Use credenciais válidas do seu backend
5. Após login, terá acesso ao dashboard

## Troubleshooting

### Erro de CORS
- Configure CORS no backend para permitir requisições do frontend

### Token não sendo enviado
- Verifique se o token está sendo salvo no localStorage
- Verifique os interceptors do Axios

### Redirecionamento infinito
- Verifique se o backend está retornando o status correto (401 para não autorizado)
- Verifique se o token está sendo validado corretamente

## Próximos Passos

1. Implementar refresh token
2. Adicionar loading states
3. Melhorar tratamento de erros
4. Adicionar testes unitários
5. Implementar recuperação de senha
