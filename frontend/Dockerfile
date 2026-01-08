# Etapa 1: Build do React/Vite
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./

# CORREÇÃO AQUI: Adicionado --legacy-peer-deps para ignorar conflitos do React 19
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# Etapa 2: Servir com Nginx
FROM nginx:alpine
# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf
# Copia nossa configuração personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copia os arquivos estáticos gerados pelo Vite (pasta dist)
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]