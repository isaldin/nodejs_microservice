import mongoose, { Document, Schema } from 'mongoose';

import { IUser } from './user.model';

interface IJWT extends Document {
  token: string;
  user: IUser['_id'];
}

interface IJWTModel extends mongoose.Model<IJWT> {
  //
}

const JWTSchema = new Schema({
  token: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, required: true }
});

const JWTModel: IJWTModel = mongoose.model<IJWT>('JWT', JWTSchema);

export default JWTModel;
