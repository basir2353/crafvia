# ── Frontend build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS web-builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── API build ───────────────────────────────────────────────────────────────
FROM node:22-alpine AS api-builder

WORKDIR /app
RUN apk add --no-cache ghostscript

COPY server/package.json server/package-lock.json ./
COPY server/prisma ./prisma
RUN npm ci

COPY server/tsconfig.json ./
COPY server/src ./src
RUN npm run build && npx prisma generate

# ── Production image ────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app
RUN apk add --no-cache ghostscript

ENV NODE_ENV=production

COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=api-builder /app/dist ./dist
COPY --from=api-builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=api-builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=api-builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=api-builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY server/prisma ./prisma
COPY --from=web-builder /app/dist ./public

EXPOSE 3001

CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/index.js"]
