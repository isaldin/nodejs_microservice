import { UserModel } from '@app/models';
import { PluginType } from '@app/types';
import convertError from '@app/utils/errors/converter';
import { buildValidationError } from '@app/utils/errors/factory';

/*
gateway                                    this ms
   +                                         +
   | post /user                              |
   | {login, password, confirm_password}     |
   +----------------------------------------->
   |                                         |
   |                                         | create user      +------------------+
   |                                         | in DB            |                  |
   |                                         +------------------>                  |
   |                                         |                  |                  |
   |                                         |                  |                  |
   |                                         |                  |   DB container   |
   |                                         | get userId       |                  |
   |                                         |                  |                  |
   |                                         +<-----------------+                  |
   |                                         |                  |                  |
   |                                         |                  +------------------+
   |                                         |
   |                return userId in response|
   |                                         |
   +<----------------------------------------+
   |                                         |
   |                                         |
   +                                         +
*/
const usersRoute: PluginType = async (fastify, options) => {
  fastify.post('/', async (req, reply) => {
    try {
      if (req.body.password !== req.body.confirm_password) {
        throw buildValidationError({
          path: 'password',
          reason: 'not matched to confirm_password'
        });
      }
      const user = await new UserModel(req.body).save();
      reply.code(201).send({ userId: user.id });
    } catch (err) {
      req.log.error({ err });
      const appError = convertError(err);
      reply.code(appError.code).send(appError);
    }
  });
};

export default usersRoute;
