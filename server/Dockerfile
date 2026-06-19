FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache ghostscript

COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build
RUN npx prisma generate

FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache ghostscript

ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY prisma ./prisma

EXPOSE 3001

CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/index.js"]
