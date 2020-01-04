// tslint:disable-next-line: no-implicit-dependencies
import supertest from 'supertest';

import buildServer from '../../index';
import { FastifyInstanceType } from '../../types';

import DBHelper from './db';

export type ServerType = supertest.SuperTest<supertest.Test>;

export default class TestServerHelper {
  private fastify: FastifyInstanceType | null;
  private dbHelper: DBHelper;

  constructor() {
    this.fastify = null;
    this.dbHelper = new DBHelper();
  }

  public async init(): Promise<ServerType> {
    await this.dbHelper.init();

    this.fastify = await buildServer();
    await this.fastify.ready();

    return supertest(this.fastify.server);
  }

  public async stop() {
    await this.fastify!.close();
    await this.dbHelper.stop();
  }
}
