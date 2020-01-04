import { UserModel } from '../../models';
import TestServerHelper, { ServerType } from '../__helpers/server';

let testServer: TestServerHelper;
let server: ServerType;

beforeAll(async () => {
  testServer = new TestServerHelper();
  server = await testServer.init();
});

afterAll(async () => {
  await testServer.stop();
});

describe('/login', () => {
  beforeAll(async () => {
    await UserModel.deleteMany({});
    await server
      .post('/user')
      .send({ login: 'zzz', password: 'xxx', confirm_password: 'xxx' })
      .expect(201);
  });

  describe('when user exists', () => {
    it('should return 200 and userId when login success', async () => {
      const resp = await server
        .post('/login')
        .send({ login: 'zzz', password: 'xxx' });

      expect(resp.status).toEqual(200);

      const user = await UserModel.findOne({ login: 'zzz' });
      expect(resp.body.userId).toEqual(user!.id);
    });

    it('should return 401 when incorrect password', async () => {
      await server
        .post('/login')
        .send({ login: 'zzz', password: 'zzz' })
        .expect(401);
    });
  });

  describe('when user non exists', () => {
    it('should return 404 and { message: "User not found" }', async () => {
      const resp = await server
        .post('/login')
        .send({ login: 'ttt', password: 'zzz' })
        .expect(404);
      expect(resp.body.message).toEqual('User not found in db');
    });
  });
});
