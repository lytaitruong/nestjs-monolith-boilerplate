import { Env } from './common.enum'

export interface IConfigApp {
  port: number
  version: string
  whitelist: string[]
}

export interface IConfig {
  env: Env
  app: IConfigApp
}
