import { IAppError } from '@/common'
import { HttpStatus } from '@nestjs/common'

export type AuthCode =
  | 'EMAIL_EXIST'
  | 'PHONE_EXIST'
  | 'USER_HAS_BEEN_DEACTIVATE'
  | 'DEVICE_NOT_FOUND'
  | 'REFRESH_TOKEN_REVOKED'

export const AUTH_ERROR: Record<AuthCode, IAppError> = {
  EMAIL_EXIST: {
    code: `2000`,
    status: HttpStatus.BAD_REQUEST,
    message: `This email has already been registered`,
  },
  PHONE_EXIST: {
    code: `2001`,
    status: HttpStatus.BAD_REQUEST,
    message: `This phone has already been registered`,
  },
  USER_HAS_BEEN_DEACTIVATE: {
    code: `2002`,
    status: HttpStatus.FORBIDDEN,
    message: `Your account has been deactivate from admin! Please contact to admin.`,
  },
  DEVICE_NOT_FOUND: {
    code: `2003`,
    status: HttpStatus.NOT_FOUND,
    message: `This device doesn't exist.`,
  },
  REFRESH_TOKEN_REVOKED: {
    code: `2004`,
    status: HttpStatus.UNAUTHORIZED,
    message: `This refresh token has been revoke!`,
  },
} as const
