import { FastifyReply, FastifyRequest } from 'fastify'
import { Env } from './common.enum'

export interface IConfigApp {
  port: number
  version: string
  service: string
  whitelist: string[]
}

export interface IConfigCookie {
  path: string
  domain: string
  secret: string
  secure: boolean
  httpOnly: boolean
}
export interface IConfig {
  env: Env
  app: IConfigApp
  cookie: IConfigCookie
}

export type IReq = FastifyRequest
export type IRes = FastifyReply
