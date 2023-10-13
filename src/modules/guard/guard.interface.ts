import { CUID, IReq } from '@/common'
import { JwtPayload } from 'jsonwebtoken'
import { IDevice } from 'ua-parser-js'
import { GuardOauth2Res, GuardRefreshRes } from './guard.dto'

export enum GuardProvider {
  GOOGLE = 'google',
  GITHUB = 'github',
}

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
  accessMaxAge: number
  refreshSecret: string
  refreshPublic: string
  refreshMaxAge: number
}

export interface IConfigOauth2 {
  clientID: string
  clientSecret: string
  callbackURL: string
  scope: string[]
}

export type IConfigGoogleOauth2 = IConfigOauth2
export type IConfigGithubOauth2 = IConfigOauth2

export interface IConfigGuard {
  jwt: IConfigJwt
  google: IConfigGoogleOauth2
  github: IConfigGithubOauth2
}

export type JwtInfo = Omit<JwtPayload, 'sub'> & {
  sub: CUID
  role: string
  device: string

  iat?: number
  exp?: number
}

export interface Oauth2Info {
  name: string
  email: string
  phone?: string
  image?: string
  provider: GuardProvider
  oauth2: {
    id: string
    accessToken: string
    refreshToken: string
  }
}
export type IReqOauth2 = IReq<Oauth2Info> & { state: boolean }

export interface IGuardService {
  signOut(info: JwtInfo): Promise<void>
  refreshToken(info: JwtInfo, token: string, maxAge: number): Promise<GuardRefreshRes>
  oauth2(info: Oauth2Info, device: IDevice): Promise<GuardOauth2Res>
}
