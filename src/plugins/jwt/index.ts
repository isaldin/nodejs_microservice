import { UserModel } from '../../models';
import { PluginType } from '../../types';

import convertError from '../../utils/errors/converter';

const jwtRoute: PluginType = async fastify => {
  fastify.post('/', async (req, reply) => {
    reply.code(200).send();
  });
};

export default jwtRoute;
