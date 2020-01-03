import fastify from 'fastify';
import mongoose from 'mongoose';

import jwtRoute from './plugins/jwt';
import loginRoute from './plugins/login';
import usersRoute from './plugins/users';
import { FastifyInstanceType } from './types';

const buildServer = async (): Promise<FastifyInstanceType> => {
  const server: FastifyInstanceType = fastify({
    logger: process.env.NODE_ENV === 'development'
  });

  server.register(usersRoute, { prefix: '/user' });
  server.register(loginRoute, { prefix: '/login' });
  server.register(jwtRoute, { prefix: '/jwt' });

  return server;
};

const start = async () => {
  const port = parseInt(process.env.PORT || '3333', 10);
  const server = await buildServer();
  try {
    await server.listen(port, '0.0.0.0');

    if (!process.env.MONGO_URL) {
      process.stderr.write(`process.env.MONGO_URL not defined!`);
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URL, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    server.log.info(`Server listening on ${port}`);
  } catch (err) {
    server.log.error(err);
    process.stderr.write(err);
    process.exit(1);
  }
  return server;
};

if (!module.parent) {
  start();
}

export default buildServer;
