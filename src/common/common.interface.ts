import { FastifyReply, FastifyRequest } from 'fastify'
import { PaginatedResult } from 'prisma-pagination'

export type UUID = string
export type GUID = string
export type CUID = string
export type ISO_DATE = string //YYYY-MM-DDTHH:mm:ss.sssZ
export type MIN_DATE = string //YYYY-MM-DD
export type NUM_DATE = number //Date.now()

export enum Env {
  DEFAULT = 'default',
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

export type TEnable = { enable: boolean }

export interface IConfigApp {
  port: number
  version: string
  service: string
  whitelist: string[] | '*'
}

export interface IConfigCookie {
  path: string
  domain: string
  secret: string
  secure: boolean
  httpOnly: boolean
}

export interface IConfigIoredis extends TEnable {
  host: string
  port: number
  username: string
  password: string
}

export interface IConfigSwagger extends TEnable {
  name: string
  pass: string
}

export interface IConfig {
  env: Env
  app: IConfigApp
  cookie: IConfigCookie
  ioredis: IConfigIoredis
  swagger: IConfigSwagger
}

export type IReq<T = void> = FastifyRequest & { user: T }
export type IRes = FastifyReply

// CRUD Interface
export type Pag<T> = PaginatedResult<T | Partial<T>>
export type Res<T> = T | Partial<T>
