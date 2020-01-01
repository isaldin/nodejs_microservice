import mongoose, { Document, Schema } from 'mongoose';

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

const UserModel = mongoose.model<IUser>('User', UserSchema);

export default UserModel;
