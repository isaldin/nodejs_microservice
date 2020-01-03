import jwtSimple from 'jwt-simple';
import { assoc, omit } from 'ramda';

import jwt, { IJWTGenerateInput } from '../../../utils/jwt/builder';

const userData: IJWTGenerateInput = {
  userId: '1q2w3e4r',
  lifeTimeInSeconds: jwt.defaultTokenLifetime
};
const testJWTSecret =
  'nd#QXUZkEJ_CTekzq6R?mj7MDqM+HKWMjDU-CRqZw4BL$5pPzyMM*uF9ufQx&&tt';

const encode = (input: any | null): string =>
  jwtSimple.encode(input, testJWTSecret);

beforeAll(() => {
  process.env = {
    ...process.env,
    JWT_SECRET: testJWTSecret
  };
});

describe('jwt utils object', () => {
  it('should has `defaultTokenLifetime` property with val 14*24*60*60 seconds', () => {
    // @ts-ignore
    expect(jwt.defaultTokenLifetime).toEqual(14 * 24 * 60 * 60);
  });

  it('should has `generateJWT` method', () => {
    // @ts-ignore
    expect(jwt.generateJWT).toBeDefined();
  });

  it('should has `isValid` method', () => {
    // @ts-ignore
    expect(jwt.isValid).toBeDefined();
  });

  describe('generateJWT', () => {
    it('throws error when env var JWT_SECRET is not set', () => {
      process.env = omit(['JWT_SECRET'], process.env);
      expect(process.env.JWT_SECRET).toBeUndefined();

      expect(() => {
        jwt.generateJWT(userData);
      }).toThrow();

      process.env = assoc('JWT_SECRET', testJWTSecret, process.env);
      expect(process.env.JWT_SECRET).toEqual(testJWTSecret);
    });

    it('returns null when required info not passed or has invalid type', () => {
      // @ts-ignore
      expect(jwt.generateJWT()).toBeNull();

      // @ts-ignore
      expect(jwt.generateJWT({ userId: null })).toBeNull();

      // @ts-ignore
      expect(jwt.generateJWT({ userId: 1 })).toBeNull();

      // @ts-ignore
      expect(jwt.generateJWT({ userId: { val: 'var' } })).toBeNull();

      // @ts-ignore
      expect(jwt.generateJWT({ key: 'string' })).toBeNull();

      // @ts-ignore
      expect(jwt.generateJWT({ userId: '' })).toBeNull();

      // @ts-ignore
      expect(jwt.generateJWT({ userId: 'd' })).toBeNull();

      // @ts-ignore
      expect(jwt.generateJWT({ lifeTimeInSeconds: 123 })).toBeNull();

      expect(
        // @ts-ignore
        jwt.generateJWT({ userId: '1', lifeTimeInSeconds: null })
      ).toBeNull();

      expect(
        // @ts-ignore
        jwt.generateJWT({ userId: '1', lifeTimeInSeconds: -123 })
      ).toBeNull();
    });

    it('should generate token', () => {
      const exp = userData.lifeTimeInSeconds + Math.round(Date.now() / 1000);
      const token = jwt.generateJWT(userData);
      expect(token).toEqual(
        jwtSimple.encode(
          { userId: userData.userId, exp },
          process.env.JWT_SECRET!
        )
      );
    });
  });

  describe('isValid', () => {
    it('should return null when not or empty string passed', () => {
      // @ts-ignore
      expect(jwt.isValid()).toBeNull();

      // @ts-ignore
      expect(jwt.isValid(1)).toBeNull();

      // @ts-ignore
      expect(jwt.isValid('')).toBeNull();

      // @ts-ignore
      expect(jwt.isValid({ var: 'val' })).toBeNull();
    });

    it('should return true when valid JWT passed', () => {
      expect(
        jwt.isValid(
          jwt.generateJWT({
            userId: 'xxx',
            lifeTimeInSeconds: jwt.defaultTokenLifetime
          })!
        )
      ).toEqual(true);
    });

    describe('should return false', () => {
      it('when encoded payload not an accepted format', () => {
        expect(jwt.isValid(encode(null))).toEqual(false);
        expect(jwt.isValid(encode('string'))).toEqual(false);
        expect(jwt.isValid(encode({}))).toEqual(false);
        expect(jwt.isValid(encode({ user: 'someId' }))).toEqual(false);
        expect(jwt.isValid(encode(false))).toEqual(false);
        expect(jwt.isValid(encode(true))).toEqual(false);
        expect(jwt.isValid(encode({ userId: 'someId' }))).toEqual(false);
        expect(jwt.isValid(encode({ lifeTimeInSeconds: 77 }))).toEqual(false);
        expect(
          jwt.isValid(encode({ userId: 'someId', lifeTimeInSeconds: -77 }))
        ).toEqual(false);
        expect(
          jwt.isValid(encode({ userId: null, lifeTimeInSeconds: 77 }))
        ).toEqual(false);
      });

      it('when token expired', () => {
        const expiredJWT = encode({
          userId: 'xxx',
          exp: Date.now() / 1000 - 10
        });
        expect(jwt.isValid(expiredJWT)).toEqual(false);
      });
    });
  });
});
