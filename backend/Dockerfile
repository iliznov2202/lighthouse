FROM node:22-trixie-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig*.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src
# Generate/build do not connect to the database. No credentials enter image layers.
RUN DATABASE_URL=postgresql://localhost/build_only npm run build

FROM node:22-trixie-slim AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends postgresql-client-17 ca-certificates openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/prisma ./prisma
COPY --from=build --chown=node:node /app/prisma.config.ts ./
COPY --from=build --chown=node:node /app/package*.json ./
COPY --chown=node:node scripts ./scripts
USER node
ENV NODE_ENV=production HOST=0.0.0.0
EXPOSE 3000
CMD ["node", "dist/src/main.js"]
