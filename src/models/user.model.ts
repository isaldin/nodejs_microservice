import mongoose, { Document, Schema } from 'mongoose';

interface IUser extends Document {
  hash: string;
  login: string;
}

const UserSchema = new Schema({
  hash: { type: String, required: true },
  login: { type: String, required: true, unique: true, index: true }
});

const UserModel = mongoose.model<IUser>('User', UserSchema);

export default UserModel;
