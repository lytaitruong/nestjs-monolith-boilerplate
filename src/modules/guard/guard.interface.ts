import { CUID, IReq } from '@/common'
import { JwtPayload } from 'jsonwebtoken'
import { GuardRefreshRes } from './guard.dto'

export enum GuardType {
  ROLE = 'role',
  GOOGLE = 'google',
  GITHUB = 'github',
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
  accessMaxAge: number
  refreshSecret: string
  refreshPublic: string
  refreshMaxAge: number
}

export interface IConfigGuard {
  jwt: IConfigJwt
}

export type JwtInfo = Omit<JwtPayload, 'sub'> & {
  sub: CUID
  role: string
  device: string

  iat?: number
  exp?: number
}

export type IReqJwt = IReq & { user: JwtInfo }

export interface IGuardService {
  signOut(info: JwtInfo): Promise<void>
  refreshToken(info: JwtInfo, token: string, maxAge: number): Promise<GuardRefreshRes>
}
