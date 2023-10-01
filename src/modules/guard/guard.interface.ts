import { CUID, IReq } from '@/common'
import { JwtPayload } from 'jsonwebtoken'

export enum GuardType {
  ACCESS = 'access-jwt',
}

export enum GuardCookie {
  ACCESS_TOKEN = 'access_token',
}

export interface IConfigJwt {
  accessSecret: string
  accessPublic: string
  accessExpire: string
  accessMaxAge: number
}

export interface IConfigGuard {
  jwt: IConfigJwt
}

export type JwtInfo = Omit<JwtPayload, 'sub'> & {
  sub: CUID
}

export type IReqJwt = IReq & { user: JwtInfo }
