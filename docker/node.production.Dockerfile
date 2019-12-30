# run from project root
# docker build --rm -f ./docker/node.production.Dockerfile . -t ib17/auth:latest

# docker run -d -p <PORT>:3333 <image-id>

FROM node:12.14.0-alpine as base

WORKDIR /usr/src/app

COPY package.json .

# prepare build folder
FROM base as prod-build
ENV NODE_ENV=production
RUN yarn --production=false
COPY . .
RUN yarn build:prod

#
FROM base as production

ENV NODE_ENV=production
ENV MONGO_URL="<mongo db connection string>"
ENV PORT=3333
EXPOSE 3333

COPY --from=prod-build /usr/src/app/build/. ./

RUN yarn --production

CMD ["node", "index.js"]