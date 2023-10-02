import { CUID, IReq } from '@/common'
import { JwtPayload } from 'jsonwebtoken'

export enum GuardType {
  ROLE = 'role',
  ACCESS = 'access-jwt',
  REFRESH = 'refresh-jwt',
}

export enum GuardCookie {
  ACCESS_TOKEN = 'access_token',
  REFRESH_TOKEN = 'refresh_token',
}

export interface IConfigJwt {
  accessSecret: string
  accessPublic: string
  accessExpire: string
  accessMaxAge: number
  refreshSecret: string
  refreshPublic: string
  refreshExpire: string
  refreshMaxAge: number
}

export interface IConfigGuard {
  jwt: IConfigJwt
}

export type JwtInfo = Omit<JwtPayload, 'sub'> & {
  sub: CUID
  role: string
}

export type IReqJwt = IReq & { user: JwtInfo }
