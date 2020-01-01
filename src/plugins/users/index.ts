import mongoose from 'mongoose';
import { UserModel } from '../../models';
import { PluginType } from '../../types';

import convertError from '../../utils/errors/converter';
import { buildValidationError } from '../../utils/errors/factory';

interface IPluginOptions {
  var: string;
}

const usersRoute: PluginType<IPluginOptions> = async (fastify, options) => {
  fastify.post('/user', async (req, reply) => {
    try {
      if (req.body.password !== req.body.confirm_password) {
        throw buildValidationError({
          path: 'password',
          reason: 'not matched to confirm_password'
        });
      }
      const user = await new UserModel(req.body).save();
      reply.code(201).send();
    } catch (err) {
      const appError = convertError(err);
      reply.code(appError.code).send(appError);
    }
  });
};

export default usersRoute;
