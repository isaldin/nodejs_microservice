import fastify from 'fastify';
import mongoose from 'mongoose';

import jwtRoute from './plugins/jwt';
import { FastifyInstanceType } from './types';

const server: FastifyInstanceType = fastify({
  logger: true
});

server.register(jwtRoute, {
  var: 'val'
});

const port = parseInt(process.env.PORT || '3000', 10);
const start = async () => {
  try {
    await server.listen(port, '0.0.0.0');

    if (!process.env.MONGO_URL) {
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
    process.exit(1);
  }
};
start();
