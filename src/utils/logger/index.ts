import { HttpResponse } from '../../types';

export default () => {
  let loggerLevel: string;
  switch (process.env.NODE_ENV) {
    case 'production':
      loggerLevel = 'info';
      break;

    case 'development':
      loggerLevel = 'debug';
      break;

    case 'test':
      loggerLevel = 'fatal';
      break;

    default:
      loggerLevel = 'error';
  }

  return {
    enabled: true,
    level: loggerLevel,
    timestamp: () => `, timestamp: ${new Date().toJSON()}`,
    prettyPrint:
      loggerLevel === 'debug'
        ? {
            levelFirst: true,
            colorize: true,
            translateTime: true
          }
        : false,
    prettifier:
      // tslint:disable-next-line: no-implicit-dependencies
      process.env.NODE_ENV === 'development' ? require('pino-pretty') : null,
    serializers: {
      res: (res: HttpResponse) => {
        return {
          status: { [res.statusCode]: res.statusMessage }
        };
      },
      req: (req: { [path: string]: any }) => ({
        method: req.method,
        url: req.url,
        path: req.path,
        parameters: req.parameters,
        // Including the headers in the log could be in violation
        // of privacy laws, e.g. GDPR. You should use the "redact" option to
        // remove sensitive fields. It could also leak authentication data in
        // the logs.
        headers: req.headers,
        body: req.body
      })
    }
  };
};
