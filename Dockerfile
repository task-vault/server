FROM node:23-slim

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN corepack enable
RUN pnpm install

COPY . .

RUN pnpm build

CMD ["pnpm", "start:prod"]