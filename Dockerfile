FROM node:12.14.0-slim as base

WORKDIR /usr/src/app

COPY package*json ./

# prepare build folder
FROM base as prod-build
ENV NODE_ENV=production
RUN yarn --production=false
COPY . .
RUN yarn build:prod

# docker build . --target=production
# docker run -p 3333:3333 -d <image-id>
FROM base as production

ENV NODE_ENV=production
ENV PORT=3333

COPY --from=prod-build /usr/src/app/build .

RUN yarn --production

EXPOSE 3333

CMD ["node", "index.js"]

#
FROM base as dev

ENV NODE_ENV=development

COPY . .

RUN yarn

CMD [ "yarn", "start:dev" ]