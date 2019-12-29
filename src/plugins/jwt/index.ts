import { PluginType } from '../../types';

interface IPluginOptionsType {
  var: string;
}

const jwtRoute: PluginType<IPluginOptionsType> = async (fastify, options) => {
  fastify.get('/jwt', async (req, reply) => {
    return { jwt: 'asdfasf' };
  });
};

export default jwtRoute;
