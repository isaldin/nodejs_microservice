## First look at microservices development in "right-way"

Node app and DB instance run in separated docker containers.

Used Typescript and I try to keep code strongly typed.

Codestyle provided by TSLint and Prettier tools.

---

#### dev-mode

run `yarn docker:dev` then open http://localhost:3000

_(you can change port in package.json scripts)_

#### dev-mode with debug

`yarn docker:debug`
then attach to `localhost:9119` (see `.vscode/launch.json`)

In both cases you have hot server restart when changes in `src` folder occur.

---

#### Production docker image (only node app, assume that you have mongoDb instance anywhere)

`docker build --rm -f ./docker/node.production.Dockerfile . -t ib17/auth:latest`

then run `docker run -d -p <PORT>:3333 --env MONGO_URL='<MONGO_CONNECTION_STRING>' <image-id>`

- \<PORT\> -- port that you prefer_
- <image-id\> -- image id that you have got on prev step
- MONGO_CONNECTION_STRING -- connection string to your mongoDB instance (don't forget singlequotes)

---

#### test

`docker:test` runs dedicated docker-container with mongo and jest in watch mode on host machine.
