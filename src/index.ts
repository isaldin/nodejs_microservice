import fastify from 'fastify';

import jwtRoute from './plugins/jwt';
import { FastifyInstanceType } from './types';

const server: FastifyInstanceType = fastify({
  logger: true
});

server.register(jwtRoute, {
  var: 'val'
});

const port = 3000;
const start = async () => {
  try {
    await server.listen(port);
    server.log.info(`server listening on ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
