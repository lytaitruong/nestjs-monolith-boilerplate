import { IAppError } from '@/common'
import { HttpStatus } from '@nestjs/common'

export type GuardCode =
  | 'FORBIDDEN_RESOURCE'
  | 'ACCESS_TOKEN_REQUIRE'
  | 'ACCESS_TOKEN_EXPIRED'
  | 'ACCESS_TOKEN_INVALID'
  | 'ACCESS_TOKEN_CLAIMS_BEFORE'
  | 'REFRESH_TOKEN_REQUIRE'
  | 'REFRESH_TOKEN_EXPIRED'
  | 'REFRESH_TOKEN_INVALID'
  | 'REFRESH_TOKEN_CLAIMS_BEFORE'
  | 'GOOGLE_OAUTH_INVALID'
  | 'GITHUB_OAUTH_INVALID'
  | 'OAUTH2_STATE_INVALID'

export const GUARD_ERROR: Record<GuardCode, IAppError> = {
  FORBIDDEN_RESOURCE: {
    name: `Forbidden Resource`,
    code: `1000`,
    message: `Your don't have enough permission to access this resource`,
    status: HttpStatus.FORBIDDEN,
  },
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
  REFRESH_TOKEN_REQUIRE: {
    name: `Refresh Token Empty`,
    code: `1005`,
    message: `Require refresh token in header`,
    status: HttpStatus.UNAUTHORIZED,
  },
  REFRESH_TOKEN_EXPIRED: {
    name: `Refresh Token Expired`,
    code: `1006`,
    message: `Your refresh token has been expired`,
    status: HttpStatus.UNAUTHORIZED,
  },
  REFRESH_TOKEN_INVALID: {
    name: `Refresh Token Invalid`,
    code: `1007`,
    message: `Your refresh token has been invalid`,
    status: HttpStatus.UNAUTHORIZED,
  },
  REFRESH_TOKEN_CLAIMS_BEFORE: {
    name: `Refresh Token Has Claims`,
    code: `1008`,
    message: `Your Refresh token has been claims before create`,
    status: HttpStatus.UNAUTHORIZED,
  },
  GOOGLE_OAUTH_INVALID: {
    name: `Google Token Invalid`,
    code: `1009`,
    message: `Your google code & state has been invalid`,
    status: HttpStatus.UNAUTHORIZED,
  },
  GITHUB_OAUTH_INVALID: {
    name: `Github Token Invalid`,
    code: `1010`,
    message: `Your github code & state has been invalid`,
    status: HttpStatus.UNAUTHORIZED,
  },
  OAUTH2_STATE_INVALID: {
    name: `Oauth2 State Invalid`,
    code: `1011`,
    message: `Your oauth2 state has been expired or invalid to prevent attack CSRF`,
    status: HttpStatus.UNAUTHORIZED,
  },
}
