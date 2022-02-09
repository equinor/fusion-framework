FROM node:16-alpine

COPY . .

RUN npm ci
RUN npm run lint
RUN npm run build