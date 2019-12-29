import { PluginType } from '../../types';

interface IPluginOptionsType {
  var: string;
}

const jwtRoute: PluginType<IPluginOptionsType> = async (fastify, options) => {
  fastify.get('/jwt', async (req, reply) => {
    return { jwt: 'xxx.yyy.zzz' };
  });
};

export default jwtRoute;
