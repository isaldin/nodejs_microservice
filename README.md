## First look at microservices development in "right-way"

(I'm trying to create auth-microservice)

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

- \<PORT\> -- port that you prefer
- <image-id\> -- image id that you have got on prev step
- MONGO_CONNECTION_STRING -- connection string to your mongoDB instance (don't forget singlequotes)

---

#### test

`yarn:test` runs jest in watch-mode on host machine.

If you need debug your test in VSCode just set breakpoint and run `Jest All` debug configuration.

You can test endpoints and models separately for each test-file (i.e. you have dedicated instance of server and mongodb for each test-file) [example](https://github.com/isaldin/nodejs_microservice/blob/506ee0601672687570a091e341e9d538d41d4075/src/tests/endpoints/login.route.test.ts)

---

#### Problems

`bcrypt` has os-related binary. because we should rebuild it for docker and local machine if versions not matched.

use `yarn bcrypt` script for doing it if you have this problem when run `yarn test` (docker do it for you in command script)
