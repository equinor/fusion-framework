FROM node:16-alpine as builder

RUN apk add --update --no-cache python3 make g++

COPY . .

RUN yarn install --frozen-lockfile
RUN npx lerna exec 'npm run prepack --if-present'