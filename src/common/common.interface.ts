import { FastifyReply, FastifyRequest } from 'fastify'
import { PaginatedResult } from 'prisma-pagination'
import { Env } from './common.enum'

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

export interface IConfigSwagger {
  name: string
  pass: string
}

export interface IConfig {
  env: Env
  app: IConfigApp
  cookie: IConfigCookie
  swagger?: IConfigSwagger
}

export type IReq = FastifyRequest
export type IRes = FastifyReply

// CRUD Interface
export type Pag<T> = PaginatedResult<T | Partial<T>>
export type Res<T> = T | Partial<T>

export interface IBaseService<T, Create, Update, Query, Param, Info = void> {
  getAll(info: Info, params: Omit<Param, 'id'>, query: Query, ...others: any[]): Promise<Pag<T>>
  create(info: Info, params: Omit<Param, 'id'>, data: Create, ...others: any[]): Promise<Res<T>>
  getOne(info: Info, params: Param, ...others: any[]): Promise<Res<T> | null>
  remove(info: Info, params: Param, ...others: any[]): Promise<Res<T> | null>
  update(info: Info, params: Param, data: Update, ...others: any[]): Promise<Res<T>>
}

export interface IBaseController<T, Create, Update, Query, Param> {
  getAll(req: IReq, params: Omit<Param, 'id'>, query: Query, ...others: any[]): Promise<Pag<T>>
  create(req: IReq, params: Omit<Param, 'id'>, data: Create, ...others: any[]): Promise<Res<T>>
  getOne(req: IReq, params: Param, ...others: any[]): Promise<Res<T> | null>
  remove(req: IReq, params: Param, ...others: any[]): Promise<Res<T> | null>
  update(req: IReq, params: Param, data: Update, ...others: any[]): Promise<Res<T>>
}

export class BaseController<T, Create, Update, Query, Param> {
  constructor(protected service: IBaseService<T, Create, Update, Query, Param>) {}
}
