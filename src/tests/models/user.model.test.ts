import { UserModel } from '../../models';

import DBHelper from '../__helpers/db';

const dbHelper = new DBHelper();

beforeAll(async () => {
  await dbHelper.init();
  process.env.JWT_SECRET = 'asdf';
});

afterAll(async () => {
  await dbHelper.stop();
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

  it('should not re-hash password after save non-modified password', async () => {
    await new UserModel({ login: 'ilya', password: 'asdf' }).save();

    const user = await UserModel.findOne({ login: 'ilya' });
    expect(user).not.toBeNull();
    const userPassword = user?.password;
    const newUser = await user?.save();
    expect(newUser).not.toBeNull();
    expect(userPassword).toEqual(newUser?.password);
  });

  it('should re-hash password after save model with new password', async () => {
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
