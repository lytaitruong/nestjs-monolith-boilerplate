import { IsSwaggerObject } from '@/common'
import { GuardCookieRes } from '@/modules/guard/guard.dto'
import { User } from '@prisma/client'
import { UserProfileRes } from '../user/user.res'

export class AuthOauth2Res extends GuardCookieRes {
  @IsSwaggerObject(UserProfileRes)
  user: Partial<User>
}
