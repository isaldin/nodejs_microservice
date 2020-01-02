import { UserModel } from '../../models';
import { PluginType } from '../../types';

import convertError from '../../utils/errors/converter';
import { buildValidationError } from '../../utils/errors/factory';

const usersRoute: PluginType = async (fastify, options) => {
  fastify.post('/', async (req, reply) => {
    try {
      if (req.body.password !== req.body.confirm_password) {
        throw buildValidationError({
          path: 'password',
          reason: 'not matched to confirm_password'
        });
      }
      await new UserModel(req.body).save();
      reply.code(201).send();
    } catch (err) {
      const appError = convertError(err);
      reply.code(appError.code).send(appError);
    }
  });
};

export default usersRoute;
