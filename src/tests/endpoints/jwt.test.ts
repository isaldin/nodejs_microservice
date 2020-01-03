// tslint:disable-next-line: no-implicit-dependencies
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
// tslint:disable-next-line: no-implicit-dependencies
import supertest from 'supertest';

import buildServer from '../../index';
import { JWTModel, UserModel } from '../../models';
import { FastifyInstanceType } from '../../types';
import jwt from '../../utils/jwt/builder';

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

  process.env = {
    ...process.env,
    JWT_SECRET:
      'nd#QXUZkEJ_CTekzq6R?mj7MDqM+HKWMjDU-CRqZw4BL$5pPzyMM*uF9ufQx&&tt'
  };
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  await fastify.close();
});

describe('/jwt', () => {
  beforeAll(async () => {
    await UserModel.deleteMany({});
  });

  describe('/generateToken', () => {
    it('should return 422 when incorect userId passed', async () => {
      await supertest(fastify.server)
        .post('/jwt/generateToken')
        .send({ userId: 'xxxxx' })
        .expect(422);
    });

    it('should return 404 when no user in DB', async () => {
      await supertest(fastify.server)
        .post('/jwt/generateToken')
        .send({ userId: mongoose.Types.ObjectId() })
        .expect(404);
    });

    describe('when user exists in DB', () => {
      let userId: string;
      beforeAll(async () => {
        const resp = await supertest(fastify.server)
          .post('/user')
          .send({ login: 'xxx', password: 'zzz', confirm_password: 'zzz' })
          .expect(201);

        userId = resp.body.userId;
      });

      it('should return valid JWT and store them in `jwt` collection', async () => {
        const resp = await supertest(fastify.server)
          .post('/jwt/generateToken')
          .send({ userId });
        expect(resp.status).toEqual(200);

        const expectedToken = jwt.generateJWT({
          userId,
          lifeTimeInSeconds: jwt.defaultTokenLifetime
        });

        const jwtInDB = await JWTModel.findOne({ user: userId });

        expect(resp.body.jwt).toEqual(expectedToken);
        expect(jwtInDB!.token).toEqual(expectedToken);
      });

      test.todo('check when jwt already exists in db (expired or not etc)');
    });
  });
});
