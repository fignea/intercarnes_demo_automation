FROM --platform=$BUILDPLATFORM node:20-alpine AS base

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

# Instalar dependencias sólo de producción
COPY package.json package-lock.json* ./
RUN npm install --omit=dev || npm install --only=production

# Copiar código fuente
COPY src ./src

# Exponer puerto (App Runner detecta PORT)
EXPOSE 3000

CMD ["node", "src/server.js"]

