// tslint:disable-next-line: no-implicit-dependencies
import { advanceTo, clear as resedDateToCurrent } from 'jest-date-mock';
import mongoose from 'mongoose';
import { assoc } from 'ramda';

import { JWTModel, UserModel } from '../../models';
import jwt from '../../utils/jwt/builder';
import TestServerHelper, { ServerType } from '../__helpers/server';

let testServer: TestServerHelper;
let server: ServerType;

const addJWTSecretToEnv = () => {
  process.env = assoc(
    'JWT_SECRET',
    'nd#QXUZkEJ_CTekzq6R?mj7MDqM+HKWMjDU-CRqZw4BL$5pPzyMM*uF9ufQx&&tt',
    process.env
  );
};

beforeAll(async () => {
  testServer = new TestServerHelper();
  server = await testServer.init();
});

afterAll(async () => {
  await testServer.stop();
});

describe('/jwt', () => {
  beforeAll(async () => {
    await UserModel.deleteMany({});
  });

  beforeEach(() => {
    addJWTSecretToEnv();
  });

  describe('/generateToken', () => {
    it('should return 422 when incorect userId passed', async () => {
      await server
        .post('/jwt/generateToken')
        .send({ userId: 'xxxxx' })
        .expect(422);
    });

    it('should return 404 and { message: "User not found" } when no user in DB', async () => {
      const resp = await server
        .post('/jwt/generateToken')
        .send({ userId: mongoose.Types.ObjectId() })
        .expect(404);
      expect(resp.body.message).toEqual('User not found');
    });

    describe('when user exists in DB', () => {
      let userId: string;
      beforeAll(async () => {
        const resp = await server
          .post('/user')
          .send({ login: 'xxx', password: 'zzz', confirm_password: 'zzz' })
          .expect(201);

        userId = resp.body.userId;
      });

      it('should return valid JWT and store them in `jwt` collection', async () => {
        const resp = await server.post('/jwt/generateToken').send({ userId });
        expect(resp.status).toEqual(200);

        const expectedToken = jwt.generateJWT({
          userId,
          lifeTimeInSeconds: jwt.defaultTokenLifetime
        });

        const jwtInDB = await JWTModel.findOne({ user: userId });

        expect(resp.body.jwt).toEqual(expectedToken);
        expect(jwtInDB!.token).toEqual(expectedToken);
      });
    });

    describe('when jwt for user exists in db', () => {
      let userId: string;
      let userJWT: string;

      beforeAll(async () => {
        const resp = await server
          .post('/user')
          .send({
            login: 'testjwt',
            password: 'x',
            confirm_password: 'x'
          })
          .expect(201);
        userId = resp.body.userId;

        await server.post('/jwt/generateToken').send({ userId });
        const jwtsForUserCount = await JWTModel.find({
          user: userId
        }).countDocuments();
        expect(jwtsForUserCount).toEqual(1);

        const jwtModel = await JWTModel.findOne({ user: userId });
        userJWT = jwtModel!.token;
        expect(userJWT).toBeDefined();
      });

      it('should return existing jwt instead of create new', async () => {
        const resp = await server.post('/jwt/generateToken').send({ userId });
        const jwtsForUserCount = await JWTModel.find({
          user: userId
        }).countDocuments();
        expect(jwtsForUserCount).toEqual(1);
        expect(resp.body.jwt).toEqual(userJWT);
      });

      describe('if stored token expired', () => {
        let expUserId: string;
        let expiredJWT: string;

        beforeAll(async () => {
          const user = await UserModel.create({
            login: 'xxxyyyzzz',
            password: 'z',
            confirm_password: 'z'
          });
          const resp = await server
            .post('/jwt/generateToken')
            .send({ userId: user.id })
            .expect(200);

          expUserId = user.id;
          expiredJWT = resp.body.jwt;
          expect(expiredJWT).toBeDefined();

          // go to future for 15 days
          advanceTo(Date.now() + 15 * 24 * 60 * 60 * 1000);
        });

        afterAll(() => {
          resedDateToCurrent();
        });

        it('should remove them, generate new and return new generated', async () => {
          const tokenForNow = jwt.generateJWT({
            userId: expUserId,
            lifeTimeInSeconds: jwt.defaultTokenLifetime
          });
          const resp = await server
            .post('/jwt/generateToken')
            .send({ userId: expUserId })
            .expect(200);
          const freshJWT = resp.body.jwt;
          expect(freshJWT).toBeDefined();

          expect(freshJWT).not.toEqual(expiredJWT);
          expect(freshJWT).toEqual(tokenForNow);
        });
      });
    });
  });
});
