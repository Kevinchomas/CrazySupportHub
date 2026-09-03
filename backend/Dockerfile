FROM node:20-alpine

# Instalar OpenSSL para que Prisma funcione sin errores en Alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Copiar manifiestos e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar esquema de Prisma y generar cliente
COPY prisma ./prisma/
RUN npx prisma generate

# Copiar el resto del código y compilar TypeScript
COPY . .
RUN npm run build

EXPOSE 4000

# Ejecutar migraciones/push a la BD y arrancar la app
CMD npx prisma db push && npm run dev