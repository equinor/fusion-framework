from node:current-alpine

WORKDIR /app

COPY package.json package.json

RUN yarn

COPY tsconfig.docker.json tsconfig.json

CMD yarn dev