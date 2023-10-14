import { IsSwaggerString } from '@/common'

export class GuardCookieRes {
  @IsSwaggerString()
  accessToken: string

  @IsSwaggerString()
  refreshToken: string
}

export class GuardRefreshRes extends GuardCookieRes {
  @IsSwaggerString()
  type: string
}

export class GuardOauth2Res extends GuardCookieRes {}
