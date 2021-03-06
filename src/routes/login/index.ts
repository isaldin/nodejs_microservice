import { UserModel } from '@app/models';
import { PluginType } from '@app/types';

import convertError from '@app/utils/errors/converter';

const loginRoute: PluginType = async fastify => {
  fastify.post('/', async (req, reply) => {
    try {
      const result = await UserModel.doLogin(req.body.login, req.body.password);
      if (!result) {
        reply.code(401).send();
      } else {
        reply.code(200).send({ userId: result });
      }
    } catch (error) {
      req.log.error({ error });
      const appError = convertError(error);
      reply.code(appError.code).send(appError);
    }
  });
};

export default loginRoute;
