import bcrypt from 'bcrypt';
import mongoose, { Document, Schema } from 'mongoose';

const SALT_WORK_FACTOR = 10;

interface IUser extends Document {
  login: string;
  password: string;
  confirm_password: string;
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

  return next();
});

const UserModel = mongoose.model<IUser>('User', UserSchema);

export default UserModel;
