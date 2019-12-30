import { UserModel } from '../../models';
import { PluginType } from '../../types';

interface IPluginOptions {
  var: string;
}

const jwtRoute: PluginType<IPluginOptions> = async (fastify, options) => {
  fastify.get('/jwt', async (req, reply) => {
    return { jwt: 'xxx.yyy.zzz' };
  });

  fastify.post('/user', async (req, reply) => {
    const user = await new UserModel(req.body).save();
    return user.toObject();
  });
};

export default jwtRoute;
