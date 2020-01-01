import mongoose from 'mongoose';

import { UserModel } from '../../models';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL!, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  await UserModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('UserModel', () => {
  beforeEach(async () => {
    await UserModel.deleteMany({});
  });
  it('password stores not in plain text', async () => {
    await new UserModel({ login: 'ilya', password: 'asdf' }).save();
    const user = await UserModel.findOne({ login: 'ilya' });
    const userPassword = user?.password;
    expect(userPassword).not.toEqual('');
    expect(userPassword).toBeTruthy();
    expect(userPassword).not.toEqual('asdf');
  });

  test("password doesn't re-hashed after save non-modified password", async () => {
    await new UserModel({ login: 'ilya', password: 'asdf' }).save();

    const user = await UserModel.findOne({ login: 'ilya' });
    expect(user).not.toBeNull();
    const userPassword = user?.password;
    const newUser = await user?.save();
    expect(newUser).not.toBeNull();
    expect(userPassword).toEqual(newUser?.password);
  });

  test('password re-hashed after save model with new password', async () => {
    await new UserModel({ login: 'ilya', password: 'asdf' }).save();

    const user = await UserModel.findOne({ login: 'ilya' });
    expect(user).not.toBeNull();
    const userPassword = user!.password;
    user!.password = 'newpassword';
    const newUser = await user!.save();
    expect(newUser).not.toBeNull();
    expect(userPassword).not.toEqual(newUser!.password);
  });

  it('should has method for comparing password with hashed password in db', async () => {
    const user = await new UserModel({
      login: 'test',
      password: 'test'
    }).save();
    const userPassword = user.password;
    expect(userPassword).not.toEqual('test');
    expect(await user.comparePassword('test')).toBe(true);
    expect(await user.comparePassword('testtest')).toBe(false);
  });
});
