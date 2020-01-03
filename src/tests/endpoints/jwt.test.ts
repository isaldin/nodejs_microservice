// tslint:disable-next-line: no-implicit-dependencies
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
// tslint:disable-next-line: no-implicit-dependencies
import supertest from 'supertest';

import buildServer from '../../index';
import { FastifyInstanceType } from '../../types';

let fastify: FastifyInstanceType;
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(mongoUri, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  fastify = await buildServer();
  await fastify.ready();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  await fastify.close();
});

describe('/jwt', () => {
  beforeAll(async () => {
    //
  });

  it('should be available over POST', async () => {
    await supertest(fastify.server)
      .post('/jwt')
      .expect(200);
  });
});
