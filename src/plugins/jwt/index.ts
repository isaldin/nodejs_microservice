import { Types } from 'mongoose';

import { JWTModel, UserModel } from '../../models';
import { PluginType } from '../../types';

import jwt from '../../utils/jwt/builder';

const jwtRoute: PluginType = async fastify => {
  fastify.post('/generateToken', async (req, reply) => {
    if (!Types.ObjectId.isValid(req.body.userId)) {
      reply.code(422).send();
      return;
    }

    try {
      const user = await UserModel.findById(req.body.userId);

      if (!user) {
        reply.code(404).send({ message: 'User not found' });
        return;
      }

      const existingJwtModel = await JWTModel.findOne({
        user: req.body.userId
      });

      if (existingJwtModel) {
        if (!JWTModel.isTokenExpiredForUser(user.id)) {
          reply.code(200).send({
            jwt: existingJwtModel.token
          });
          return;
        } else {
          await existingJwtModel.remove();
        }
      }

      const token = jwt.generateJWT({
        userId: user!.id,
        lifeTimeInSeconds: jwt.defaultTokenLifetime
      });

      // FIXME: move generation to presave in model
      const jwtModel = await new JWTModel({
        token,
        user
      }).save();

      reply.code(200).send({
        jwt: jwtModel.token
      });
    } catch (error) {
      // tslint:disable-next-line: no-console
      console.error(error); // TODO: log it
      reply.code(500).send();
    }
  });
};

export default jwtRoute;
