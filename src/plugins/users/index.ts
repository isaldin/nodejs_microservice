import { UserModel } from '../../models';
import { PluginType } from '../../types';

import convertError from '../../utils/errors/converter';

interface IPluginOptions {
  var: string;
}

const usersRoute: PluginType<IPluginOptions> = async (fastify, options) => {
  fastify.post('/user', async (req, reply) => {
    try {
      const user = await new UserModel(req.body).save();
      reply.code(200).send(user.toObject());
    } catch (err) {
      const appError = convertError(err);
      reply.code(appError.code).send(appError);
    }
  });
};

export default usersRoute;
