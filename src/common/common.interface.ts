import { FastifyReply, FastifyRequest } from 'fastify'
import { Env } from './common.enum'

export interface IConfigApp {
  port: number
  version: string
  service: string
  whitelist: string[]
}

export interface IConfig {
  env: Env
  app: IConfigApp
}

export type IReq = FastifyRequest
export type IRes = FastifyReply
