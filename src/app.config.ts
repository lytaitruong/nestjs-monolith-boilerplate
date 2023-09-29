import { Env, IConfig } from './common'

export const configuration = (): IConfig => ({
  env: (process.env['NODE' + '_ENV'] as Env) || Env.DEFAULT,
  app: {
    port: process.env.APP_PORT ? +process.env.APP_PORT : 3000,
    version: process.env.APP_VERSION || 'v1',
    service: process.env.APP_SERVICE || 'NestJS Boilerplate',
    whitelist: typeof process.env.APP_WHITELIST === 'string' ? process.env.APP_WHITELIST.split(',') : [],
  },
})
