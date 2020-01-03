// tslint:disable-next-line: no-implicit-dependencies
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
// tslint:disable-next-line: no-implicit-dependencies
import supertest from 'supertest';

import buildServer from '../../index';
import { UserModel } from '../../models';
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

describe('/login', () => {
  beforeAll(async () => {
    await UserModel.deleteMany({});
    await supertest(fastify.server)
      .post('/user')
      .send({ login: 'zzz', password: 'xxx', confirm_password: 'xxx' })
      .expect(201);
  });

  describe('when user exists', () => {
    it('should return 200 and userId when login success', async () => {
      const resp = await supertest(fastify.server)
        .post('/login')
        .send({ login: 'zzz', password: 'xxx' });

      expect(resp.status).toEqual(200);

      const user = await UserModel.findOne({ login: 'zzz' });
      expect(resp.body.userId).toEqual(user!.id);
    });

    it('should return 401 when incorrect password', async () => {
      await supertest(fastify.server)
        .post('/login')
        .send({ login: 'zzz', password: 'zzz' })
        .expect(401);
    });
  });

  describe('when user non exists', () => {
    it('should return 404', async () => {
      await supertest(fastify.server)
        .post('/login')
        .send({ login: 'ttt', password: 'zzz' })
        .expect(404);
    });
  });
});
