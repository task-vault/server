FROM node:23-slim

WORKDIR /app
COPY package.json pnpm-lock.yaml ./

RUN corepack enable
RUN pnpm install

COPY . .

RUN pnpm build
RUN pnpm prune --prod

CMD ["pnpm", "start:prod"]