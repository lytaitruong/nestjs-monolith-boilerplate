# Build Dist file
FROM node:20-bullseye-slim as builder

ARG NODE_ENV
ENV NODE_ENV ${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json bun.lockb tsconfig*.json nest-cli.json ./
COPY prisma ./prisma

RUN apt-get update \
  && apt-get install -y openssl python3 build-essential \
  && npm i -g bun \
  && npm i -g pnpm

COPY . .

RUN bun install \
  && pnpm run prisma:generate \
  && pnpm run build \
  && pnpm pkg delete scripts.prepare \
  && pnpm prune --prod

# Remove devDependencies Package.json
FROM node:20-bullseye-slim as remover

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json /usr/src/app/bun.lockb ./
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Running Image
FROM node:20-bullseye-slim as running

WORKDIR /usr/src/app

COPY --from=remover /usr/src/app ./

EXPOSE 3333

CMD ["node", "dist/main.js"]