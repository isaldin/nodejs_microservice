// tslint:disable-next-line: no-implicit-dependencies
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
// tslint:disable-next-line: no-implicit-dependencies
import supertest from 'supertest';

import buildServer from '../../index';
import { FastifyInstanceType } from '../../types';

export type ServerType = supertest.SuperTest<supertest.Test>;

export default class TestServerHelper {
  private fastify: FastifyInstanceType | null;
  private mongoServer: MongoMemoryServer;

  constructor() {
    this.mongoServer = new MongoMemoryServer();
    this.fastify = null;
  }

  public async init(): Promise<ServerType> {
    const mongoUri = await this.mongoServer.getUri();
    await mongoose.connect(mongoUri, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    this.fastify = await buildServer();
    await this.fastify.ready();

    return supertest(this.fastify.server);
  }

  public async stop() {
    await mongoose.disconnect();
    await this.mongoServer.stop();
    await this.fastify!.close();
  }
}
