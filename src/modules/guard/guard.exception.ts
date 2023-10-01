import { IAppError } from '@/common'
import { HttpStatus } from '@nestjs/common'

export type GuardCode =
  | 'ACCESS_TOKEN_REQUIRE'
  | 'ACCESS_TOKEN_EXPIRED'
  | 'ACCESS_TOKEN_INVALID'
  | 'ACCESS_TOKEN_CLAIMS_BEFORE'

export const GUARD_ERROR: Record<GuardCode, IAppError> = {
  ACCESS_TOKEN_REQUIRE: {
    name: `Access Token Empty`,
    code: `1001`,
    message: `Require access token in header`,
    status: HttpStatus.UNAUTHORIZED,
  },
  ACCESS_TOKEN_EXPIRED: {
    name: `Access Token Expired`,
    code: `1002`,
    message: `Your access token has been expired`,
    status: HttpStatus.UNAUTHORIZED,
  },
  ACCESS_TOKEN_INVALID: {
    name: `Access Token Invalid`,
    code: `1003`,
    message: `Your access token has been invalid`,
    status: HttpStatus.UNAUTHORIZED,
  },
  ACCESS_TOKEN_CLAIMS_BEFORE: {
    name: `Access Token Has Claims`,
    code: `1004`,
    message: `Your access token has been claims before create`,
    status: HttpStatus.UNAUTHORIZED,
  },
}
