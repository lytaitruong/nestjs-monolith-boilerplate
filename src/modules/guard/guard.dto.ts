import { IsSwaggerString } from '@/common'

export class GuardCookieRes {
  @IsSwaggerString({ required: true })
  accessToken: string

  @IsSwaggerString({ required: true })
  refreshToken: string
}

export class GuardRefreshRes extends GuardCookieRes {
  @IsSwaggerString({ required: true })
  type: string
}

export class GuardOauth2Res extends GuardCookieRes {}
