import mongoose from 'mongoose';
// tslint:disable-next-line: no-implicit-dependencies
import supertest from 'supertest';

import buildServer from '../../index';
import { UserModel } from '../../models';
import { FastifyInstanceType } from '../../types';

let fastify: FastifyInstanceType;

beforeAll(async () => {
  if (!process.env.MONGO_URL) {
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URL, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  fastify = await buildServer();
  await fastify.ready();
});

afterAll(async done => {
  await fastify.close();
  await mongoose.connection.close();
  done();
});

describe('/users route', () => {
  describe('create', () => {
    beforeEach(async () => {
      await UserModel.deleteMany({});
    });

    it('should return new user in response when user non exists', async () => {
      const resp = await supertest(fastify.server)
        .post('/user')
        .send({ login: 'ilya', hash: 'asdf' })
        .expect(200);
      expect(resp.body.login).toEqual('ilya');
      expect(resp.body.hash).toEqual('asdf');
    });

    it('should return 422 when user exists', async () => {
      await UserModel.create({ login: 'ilya', hash: 'asdf' });
      const resp = await supertest(fastify.server)
        .post('/user')
        .send({ login: 'ilya', hash: 'asdf' })
        .expect(422);
      expect(resp.body.message).toEqual('Duplicate entity');
    });

    it('should return 422 and validation error when empty login provided', async () => {
      const resp = await supertest(fastify.server)
        .post('/user')
        .send({ login: '', hash: 'asdf' })
        .expect(422);
      expect(resp.body.message).toEqual('Validation error');
      expect(resp.body.errors).toEqual({ login: 'required' });
    });

    it('should return 422 and validation error when empty hash provided', async () => {
      const resp = await supertest(fastify.server)
        .post('/user')
        .send({ login: 'ilya', hash: '' })
        .expect(422);
      expect(resp.body.message).toEqual('Validation error');
      expect(resp.body.errors).toEqual({ hash: 'required' });
    });
  });
});
