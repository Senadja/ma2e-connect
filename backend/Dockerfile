# ---- Étape build : compilation TypeScript (app + seed) ----
FROM node:22-alpine AS build
WORKDIR /app
# Prisma sur Alpine nécessite openssl + libc6-compat (musl).
RUN apk add --no-cache openssl libc6-compat
# bcrypt/prisma ont des binaires natifs ; on installe sous Linux/musl
# (npm install plutôt que npm ci : le lockfile peut être généré sous Windows).
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY prisma ./prisma
RUN npx prisma generate
COPY tsconfig.json tsconfig.seed.json ./
COPY src ./src
# Compile l'API (dist/) et le seed (dist-seed/) → exécutables avec node, sans ts-node.
RUN npm run build && npx tsc -p tsconfig.seed.json

# ---- Étape runtime ----
FROM node:22-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
# Dépendances complètes : prisma CLI nécessaire pour `prisma db push` au démarrage.
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY prisma ./prisma
RUN npx prisma generate
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-seed ./dist-seed
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh && mkdir -p /app/uploads
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
