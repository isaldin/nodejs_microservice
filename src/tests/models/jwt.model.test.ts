import { advanceTo, clear as resetDateToCurrent } from 'jest-date-mock';
// tslint:disable-next-line: no-implicit-dependencies
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import { JWTModel, UserModel } from '../../models';
import jwt from '../../utils/jwt/builder';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(mongoUri, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  process.env.JWT_SECRET = 'asdf';
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('JWTModel', () => {
  test.todo('restrict to create record if user exists in collection');

  test.todo('generates token for user on presave');

  describe('method `isTokenExpiredForUser`', () => {
    it('should be exist', () => {
      expect(typeof JWTModel.isTokenExpiredForUser).toBe('function');
    });

    it('should return `true` when token expired', async () => {
      const user = await UserModel.create({
        login: 'asdf',
        password: 'x',
        confirm_password: 'x'
      });

      // go to past for 15 days
      advanceTo(Date.now() - 15 * 24 * 60 * 60 * 1000);
      const expiredToken = jwt.generateJWT({
        userId: user!.id,
        lifeTimeInSeconds: jwt.defaultTokenLifetime
      });
      await JWTModel.create({
        user,
        token: expiredToken
      });
      resetDateToCurrent();
      const isTokenExpired = await JWTModel.isTokenExpiredForUser(user.id);
      expect(isTokenExpired).toEqual(true);
    });

    it('should return `false` when token not expired', async () => {
      const user = await UserModel.create({
        login: 'zxcv',
        password: 'x',
        confirm_password: 'x'
      });

      await JWTModel.deleteMany({});
      const token = jwt.generateJWT({
        userId: user!.id,
        lifeTimeInSeconds: jwt.defaultTokenLifetime
      });
      await JWTModel.create({ user, token });
      expect(await JWTModel.isTokenExpiredForUser(user.id)).toEqual(false);
    });

    describe('should return null', () => {
      test('when user not exist', async () => {
        expect(
          await JWTModel.isTokenExpiredForUser(new mongoose.Types.ObjectId())
        ).toBe(null);
      });

      test('when jwt for user not exist', async () => {
        const user = await UserModel.create({
          login: '1q2w3e4r',
          password: 'x',
          confirm_password: 'x'
        });
        expect(await JWTModel.isTokenExpiredForUser(user.id)).toBe(null);
      });
    });
  });
});
