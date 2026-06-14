# Estágio 1: Compilação da aplicação React com Node 24
FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./

# Instala todas as dependências (incluindo devDependencies como o Vite e Tailwind v4)
RUN npm install

COPY . .

# Gera os arquivos estáticos de produção na pasta /app/dist
RUN npm run build

# Estágio 2: Servidor Web Nginx leve para servir os arquivos estáticos
FROM nginx:1.25-alpine

# Copia os arquivos compilados do React para o diretório padrão do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expõe a porta padrão do servidor web
EXPOSE 80

# Inicia o Nginx em primeiro plano
CMD ["nginx", "-g", "daemon off;"]
