import { FastifyInstance, Plugin, RegisterOptions } from 'fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';

export type HttpServer = Server;
export type HttpRequest = IncomingMessage;
export type HttpResponse = ServerResponse;

type PluginOptionsType = RegisterOptions<HttpServer, HttpRequest, HttpResponse>;

export type PluginType<Options extends PluginOptionsType = {}> = Plugin<
  HttpServer,
  HttpRequest,
  HttpResponse,
  Options
>;

export type FastifyInstanceType = FastifyInstance<
  HttpServer,
  HttpRequest,
  HttpResponse
>;
