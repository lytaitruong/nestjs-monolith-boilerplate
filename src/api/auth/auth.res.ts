import { IsSwaggerString } from '@/common'

export class AuthCookieRes {
  @IsSwaggerString()
  accessToken: string

  @IsSwaggerString()
  refreshToken: string
}

export class AuthRefreshRes extends AuthCookieRes {
  @IsSwaggerString()
  type: string
}
