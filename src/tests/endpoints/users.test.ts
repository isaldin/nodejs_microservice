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

    it('should return 201 when user non exists', async () => {
      const resp = await supertest(fastify.server)
        .post('/user')
        .send({ login: 'ilya', password: '1', confirm_password: '1' })
        .expect(201);
    });

    it('should return 422 when user exists', async () => {
      await UserModel.create({
        login: 'ilya',
        password: '1',
        confirm_password: '1'
      });
      const resp = await supertest(fastify.server)
        .post('/user')
        .send({ login: 'ilya', password: '1', confirm_password: '1' })
        .expect(422);
      expect(resp.body.message).toEqual('Duplicate entity');
    });

    describe('should return 422 and validation error', () => {
      it('when empty login provided', async () => {
        const resp = await supertest(fastify.server)
          .post('/user')
          .send({ login: '', password: '1', confirm_password: '1' })
          .expect(422);
        expect(resp.body.message).toEqual('Validation error');
        expect(resp.body.errors).toEqual({ login: 'required' });
      });

      it('when passwords are empty', async () => {
        const resp = await supertest(fastify.server)
          .post('/user')
          .send({ login: 'ilya', password: '', confirm_password: '' })
          .expect(422);
        expect(resp.body.message).toEqual('Validation error');
        expect(resp.body.errors).toEqual({ password: 'required' });
      });

      it('when passwords are not matched', async () => {
        const resp = await supertest(fastify.server)
          .post('/user')
          .send({ login: 'ilya', password: '1', confirm_password: '2' })
          .expect(422);
        expect(resp.body.message).toEqual('Validation error');
        expect(resp.body.errors).toEqual({
          password: 'not matched to confirm_password'
        });
      });
    });
  });
});
