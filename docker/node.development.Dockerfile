FROM node:12.14-slim

ENV NODE_ENV=development

WORKDIR /usr/src/app

COPY package.json .

COPY docker/wait_for_it.sh .

RUN yarn install

COPY . .

RUN yarn