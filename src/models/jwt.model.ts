import jwtSimple from 'jwt-simple';
import mongoose, { Document, Schema } from 'mongoose';

import { UserModel } from '.';
import { IUser } from './user.model';

interface IJWT extends Document {
  token: string;
  user: IUser['_id'];
}

interface IJWTModel extends mongoose.Model<IJWT> {
  isTokenExpiredForUser: (userId: IUser['_id']) => Promise<boolean>;
}

const JWTSchema = new Schema({
  token: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, required: true }
});

JWTSchema.statics.isTokenExpiredForUser = async (
  userId: IUser['_id']
): Promise<boolean | null> => {
  const user = await UserModel.findById(userId);

  if (!user) {
    return null;
  }

  const jwt = await JWTModel.findOne({ user });

  if (!jwt) {
    return null;
  }

  try {
    jwtSimple.decode(jwt!.token, process.env.JWT_SECRET!);
  } catch (error) {
    if ((error as Error) && error.message === 'Token expired') {
      return true;
    }

    throw error;
  }

  return Promise.resolve(false);
};

const JWTModel: IJWTModel = mongoose.model<IJWT, IJWTModel>('JWT', JWTSchema);

export default JWTModel;
