import bcrypt from 'bcrypt';
import mongoose, { Document, Schema, Types } from 'mongoose';

import { IAppError } from '../utils/errors/types';

const SALT_WORK_FACTOR = 10;

interface IUser extends Document {
  login: string;
  password: string;
  confirm_password: string;
  comparePassword: (password: string) => Promise<boolean>;
}

interface IUserModel extends mongoose.Model<IUser> {
  doLogin: (login: string, password: string) => Promise<Types.ObjectId>;
}

const UserSchema = new Schema({
  login: { type: String, required: true, index: { unique: true } },
  password: {
    type: String,
    required: true
  }
});

UserSchema.pre('save', async function(this: IUser, next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
    return next();
  } catch (error) {
    return next(error);
  }
});

UserSchema.methods.comparePassword = async function(
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.doLogin = async function(
  this: IUser,
  login: string,
  password: string
): Promise<Types.ObjectId | null> {
  const user = await this.model('User').findOne({ login });

  if (!user) {
    const userNotFoundError: IAppError = {
      name: 'UserNotFoundError',
      code: 404,
      message: 'User not found in db'
    };
    throw userNotFoundError;
  }

  if (user as IUser) {
    const isCorrectPassword = await (user! as IUser).comparePassword(password);
    if (isCorrectPassword) {
      return user.id;
    } else {
      const passwordIncorrectError: IAppError = {
        code: 401,
        name: 'AuthError',
        message: 'Password is incorrect'
      };
      throw passwordIncorrectError;
    }
  }
  return Promise.resolve(null);
};

const UserModel: IUserModel = mongoose.model<IUser, IUserModel>(
  'User',
  UserSchema
);

export default UserModel;
