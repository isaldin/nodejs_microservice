import mongoose from 'mongoose';
import { UserModel } from '../../models';
import { PluginType } from '../../types';

import convertError from '../../utils/errors/converter';
import { buildValidationError } from '../../utils/errors/factory';

interface IPluginOptions {
  var: string;
}

const loginRoute: PluginType<IPluginOptions> = async (fastify, options) => {
  fastify.post('/login', async (req, reply) => {
    const result = await UserModel.doLogin(req.body.login, req.body.password);
    reply.code(result ? 200 : 401).send();
  });
};

export default loginRoute;
