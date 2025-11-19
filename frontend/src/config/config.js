// Configuração centralizada da API
export const API_CONFIG = {
    BASE_URL: 'http://localhost:8080/api/v1',
    TIMEOUT: 10000,
    HEADERS: {
        'Content-Type': 'application/json',
    },
};

// Endpoints da API
export const API_ENDPOINTS = {
    REGISTER: '/users',
    AUTH: '/auth',
    AUTH_VALIDATE: '/auth/validate',
    USERS_ME: '/users/me',
    USERS: '/users',
    UPDATE_PROFILE: '/users/me',
    CLIENTS: 'clients',
    VEHICLES: 'vehicles',
    QUOTATIONS: 'quotations',
    PARTS: 'parts',
    REPAIR_SERVICES: 'repair-services',
};

// Env
export const ENV = {
  URL: 'http://www.mechtech.com.br',
  TITLE: 'Mechtech',
  LOGO: "./img/mechtech.png"
}