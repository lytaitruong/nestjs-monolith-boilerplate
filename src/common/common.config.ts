import { randomBytes, randomUUID } from 'crypto'
import { Env, IConfig } from '.'

export const configuration = (): IConfig => ({
  env: (process.env['NODE' + '_ENV'] as Env) || Env.DEFAULT,
  app: {
    port: process.env.APP_PORT ? +process.env.APP_PORT : 3000,
    version: process.env.APP_VERSION || 'v1',
    service: process.env.APP_SERVICE || 'NestJS Boilerplate',
    whitelist: typeof process.env.APP_WHITELIST === 'string' ? process.env.APP_WHITELIST.split(',') : '*',
  },
  cookie: {
    path: process.env.COOKIE_PATH || '/',
    domain: process.env.COOKIE_DOMAIN || 'localhost',
    secret: process.env.COOKIE_SECRET || randomBytes(32).toString('base64'),
    secure: process.env.NODE_ENV !== Env.DEFAULT,
    httpOnly: process.env.NODE_ENV !== Env.DEFAULT,
  },
  ioredis: {
    enable: process.env.IOREDIS_ENABLE === 'true' ?? false,
    host: process.env.IOREDIS_HOST || 'localhost',
    port: process.env.IOREDIS_PORT ? parseInt(process.env.IOREDIS_PORT) : 6379,
    username: process.env.IOREDIS_USERNAME || 'default',
    password: process.env.IOREDIS_PASSWORD,
  },
  swagger: {
    enable: process.env.SWAGGER_ENABLE === 'true' ?? false,
    name: process.env.SWAGGER_NAME,
    pass: process.env.SWAGGER_PASS,
  },
})

/**
 * @returns @fastify/multipart upload settings
 */
export const uploadSetting = () => ({
  limits: {
    fieldNameSize: 100, // Max field name size in bytes
    fieldSize: 100, // Max field value size in bytes
    fields: 10, // Max number of non-file fields
    fileSize: 1024 * 1024, // For multipart forms, the max file size in bytes
    files: 10, // Max number of file fields
    headerPairs: 2000, // Max number of header key=>value pairs
    parts: 1000, // For multipart forms, the max number of parts (fields + files)
  },
})

/**
 * @returns @fastify/helmet header settings
 */
export const helmetSetting = () => ({
  contentSecurityPolicy:
    process.env['NODE_ENV'] === Env.PRODUCTION
      ? {
          directives: {
            defaultSrc: [`'self'`, 'unpkg.com'],
            styleSrc: [`'self'`, `'unsafe-inline'`, 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'unpkg.com'],
            fontSrc: [`'self'`, 'fonts.gstatic.com', 'data:'],
            imgSrc: [`'self'`, 'data:', 'cdn.jsdelivr.net'],
            scriptSrc: [`'self'`, `https: 'unsafe-inline'`, `cdn.jsdelivr.net`, `'unsafe-eval'`],
          },
        }
      : false,
})

/**
 * @returns generateId for request.id header
 */
export const genReqId = (req: { id: any; headers: { [x: string]: any } }): string => req.id ?? randomUUID()
