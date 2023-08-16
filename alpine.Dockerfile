ARG NODE_VERSION=lts-alpine
FROM node:${NODE_VERSION}

WORKDIR /app

RUN apk add --update --no-cache curl python3 make g++
RUN curl -L https://unpkg.com/@pnpm/self-installer | node

COPY pnpm-lock.yaml ./
RUN pnpm fetch

COPY . .

RUN pnpm i --frozen-lockfile


RUN pnpm lint
RUN pnpm --filter @equinor/fusion-framework-cli... build
RUN pnpm link ./packages/cli
RUN pnpm build