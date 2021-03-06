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

describe('/users route', () => {
  describe('create', () => {
    beforeEach(async () => {
      await UserModel.deleteMany({});
    });

    describe('when user non exists', () => {
      it('should create user in db and return 201 with id for new user', async () => {
        const resp = await server
          .post('/user')
          .send({ login: 'ilya', password: '1', confirm_password: '1' });

        expect(resp.status).toEqual(201);

        const user = await UserModel.findOne({ login: 'ilya' });
        expect(user!.login).toEqual('ilya');
        expect(resp.body.userId).toEqual(user!.id);
      });

      it("shouldn't return password in response", async () => {
        const resp = await server
          .post('/user')
          .send({ login: 'ilya', password: '1', confirm_password: '1' });

        expect(resp.status).toEqual(201);
        expect(resp.body).not.toHaveProperty('password');
      });
    });

    it('should return 422 when user exists', async () => {
      await UserModel.create({
        login: 'ilya',
        password: '1',
        confirm_password: '1'
      });
      const resp = await server
        .post('/user')
        .send({ login: 'ilya', password: '1', confirm_password: '1' })
        .expect(422);
      expect(resp.body.message).toEqual('Duplicate entity');
    });

    describe('should return 422 and validation error', () => {
      it('when empty login provided', async () => {
        const resp = await server
          .post('/user')
          .send({ login: '', password: '1', confirm_password: '1' })
          .expect(422);
        expect(resp.body.message).toEqual('Validation error');
        expect(resp.body.errors).toEqual({ login: 'required' });
      });

      it('when passwords are empty', async () => {
        const resp = await server
          .post('/user')
          .send({ login: 'ilya', password: '', confirm_password: '' })
          .expect(422);
        expect(resp.body.message).toEqual('Validation error');
        expect(resp.body.errors).toEqual({ password: 'required' });
      });

      it('when passwords are not matched', async () => {
        const resp = await server
          .post('/user')
          .send({ login: 'ilya', password: '1', confirm_password: '2' })
          .expect(422);
        expect(resp.body.message).toEqual('Validation error');
        expect(resp.body.errors).toEqual({
          password: 'not matched to confirm_password'
        });
      });
    });
  });
});
