FROM node:12.14

ENV NODE_ENV=development

WORKDIR /usr/src/app

COPY package.json .

RUN yarn install

COPY . .

ENV PORT=3333

RUN yarn

CMD [ "yarn", "start:dev" ]