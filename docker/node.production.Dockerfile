# run from project root
# docker build --rm -f ./docker/node.production.Dockerfile . -t ib17/auth:latest

# docker run -d -p <PORT>:3333 --restart on-failure --env MONGO_URL='<MONGO_CONNECTION_STRING>' ib17/auth:latest

FROM node:12.14 as build-env

WORKDIR /usr/src/app

COPY package.json .

ENV NODE_ENV=production
RUN yarn install --production=false
COPY . .
RUN yarn build:prod
RUN rm -rf node_modules && yarn install --production

#
FROM mhart/alpine-node:slim-12.14.0

WORKDIR /home/app

ENV NODE_ENV=production
ENV PORT=3333
EXPOSE 3333

COPY --from=build-env /usr/src/app/build/. ./
COPY --from=build-env /usr/src/app/node_modules/. ./node_modules

CMD ["node", "index.js"]