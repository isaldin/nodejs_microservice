import { FastifyInstance, Plugin, RegisterOptions } from 'fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';

type HttpServer = Server;
type HttpRequest = IncomingMessage;
type HttpResponse = ServerResponse;

type PluginOptionsType = RegisterOptions<HttpServer, HttpRequest, HttpResponse>;

export type PluginType<Options extends PluginOptionsType = {}> = Plugin<
  HttpServer,
  HttpRequest,
  HttpResponse,
  Options
>;

export type FastifyInstanceType = FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse
>;
