import fastify from 'fastify';
import mongoose from 'mongoose';

import jwtRoute from './routes/jwt';
import loginRoute from './routes/login';
import usersRoute from './routes/user';
import { FastifyInstanceType } from './types';
import logger from './utils/logger';

const buildServer = async (): Promise<FastifyInstanceType> => {
  const server: FastifyInstanceType = fastify({
    logger: logger()
  });

  // The body not can serialize inside req method,
  // because the request is serialized when we create the child logger.
  // At that time, the body is not parsed yet.
  // https://www.fastify.io/docs/latest/Logging/
  server.addHook('preHandler', (req, reply, done) => {
    if (req.body) {
      req.log.info({ body: req.body }, 'incoming request body');
    }
    done();
  });

  server.register(usersRoute, { prefix: '/user' });
  server.register(loginRoute, { prefix: '/login' });
  server.register(jwtRoute, { prefix: '/jwt' });

  return server;
};

const start = async () => {
  if (!process.env.JWT_SECRET) {
    throw new Error();
  }

  const port = parseInt(process.env.PORT || '3333', 10);
  const server = await buildServer();
  server.log.error('test');
  try {
    await server.listen(port, '0.0.0.0');

    if (!process.env.MONGO_URL) {
      server.log.fatal('process.env.MONGO_URL not defined!');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URL, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    server.log.info(`Server listening on ${port}`);
  } catch (err) {
    server.log.error({ error: err });
    process.stderr.write(err);
    process.exit(1);
  }
  return server;
};

if (!module.parent) {
  start();
}

export default buildServer;
