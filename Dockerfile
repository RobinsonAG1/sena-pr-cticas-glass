# ==============================================================================
# 1. Etapa de compilación (Builder)
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar manifiestos de dependencias
COPY package*.json ./

# Instalar dependencias limpias
RUN npm ci || npm install

# Variables de entorno para Vite en tiempo de compilación (Coolify Build Args)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Copiar el código fuente completo
COPY . .

# Construir los archivos estáticos de producción (dist)
RUN npm run build

# ==============================================================================
# 2. Etapa de producción con Nginx ultra liviano
# ==============================================================================
FROM nginx:alpine

# Limpiar directorio web por defecto
RUN rm -rf /usr/share/nginx/html/*

# Copiar los archivos compilados desde la etapa builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración de Nginx para SPA (React Router / Vite) y compresión Gzip
RUN printf 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    gzip on;\n\
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;\n\
\n\
    # Enrutamiento para SPA (evita error 404 al recargar rutas)\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
\n\
    # Caché estática para assets\n\
    location ~* \\.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg)$ {\n\
        expires 6M;\n\
        access_log off;\n\
        add_header Cache-Control "public, max-age=15552000, immutable";\n\
    }\n\
\n\
    # Cabeceras de seguridad\n\
    add_header X-Frame-Options "SAMEORIGIN" always;\n\
    add_header X-XSS-Protection "1; mode=block" always;\n\
    add_header X-Content-Type-Options "nosniff" always;\n\
}\n' > /etc/nginx/conf.d/default.conf

# Puerto expuesto en el contenedor (Coolify mapeará este puerto)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
