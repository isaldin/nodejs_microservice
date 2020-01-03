import jwtSimple from 'jwt-simple';
import {
  __,
  anyPass,
  both,
  complement,
  gt,
  is,
  isEmpty,
  lt,
  where
} from 'ramda';

export interface IJWTGenerateInput {
  userId: string;
  lifeTimeInSeconds: number;
}

export default {
  generateJWT: (input: IJWTGenerateInput): string | null => {
    if (!process.env.JWT_SECRET) {
      throw new Error();
    }

    const isUserIdInvalid = anyPass([isEmpty, complement(is(String))]);
    const isLifeTimeInvalid = anyPass([complement(is(Number)), lt(__, 0)]);

    if (
      !input ||
      isUserIdInvalid(input.userId) ||
      isLifeTimeInvalid(input.lifeTimeInSeconds)
    ) {
      return null;
    }

    return jwtSimple.encode(
      {
        userId: input.userId,
        exp: Date.now() / 1000 + input.lifeTimeInSeconds
      },
      process.env.JWT_SECRET
    );
  },

  isValid: (jwt: string): boolean | null => {
    const isJwtInvalid = anyPass([isEmpty, complement(is(String))]);

    if (isJwtInvalid(jwt)) {
      return null;
    }

    try {
      const payload = jwtSimple.decode(jwt, process.env.JWT_SECRET!);
      return where(
        {
          userId: is(String),
          exp: both(is(Number), gt(__, 0))
        },
        payload
      );
    } catch (err) {
      return false;
    }
  }
};
