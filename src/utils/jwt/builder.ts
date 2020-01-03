import jwtSimple from 'jwt-simple';
import { __, both, gt, is, where } from 'ramda';

export interface IJWTGenerateInput {
  userId: string;
  lifeTimeInSeconds: number;
}

export default {
  generateJWT: (input: IJWTGenerateInput): string | null => {
    if (!process.env.JWT_SECRET) {
      throw new Error();
    }

    if (typeof input?.userId !== 'string' || input.userId === '') {
      return null;
    }

    if (
      typeof input.lifeTimeInSeconds !== 'number' ||
      input.lifeTimeInSeconds < 1
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
    if (typeof jwt !== 'string' || jwt === '') {
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
