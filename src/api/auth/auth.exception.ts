import { IAppError } from '@/common'
import { HttpStatus } from '@nestjs/common'

export type AuthCode = 'USER_HAS_BEEN_DEACTIVATE' | 'DEVICE_NOT_FOUND' | 'REFRESH_TOKEN_REVOKED'

export const AUTH_ERROR: Record<AuthCode, IAppError> = {
  USER_HAS_BEEN_DEACTIVATE: {
    name: `User has been deactivate`,
    code: `2000`,
    status: HttpStatus.FORBIDDEN,
    message: `Your account has been deactivate from admin! Please contact to admin.`,
  },
  DEVICE_NOT_FOUND: {
    name: `Device Not Found`,
    code: `2001`,
    status: HttpStatus.NOT_FOUND,
    message: `This device doesn't exist.`,
  },
  REFRESH_TOKEN_REVOKED: {
    name: `Refresh Token Revoked`,
    code: `2002`,
    status: HttpStatus.UNAUTHORIZED,
    message: `This refresh token has been revoke!`,
  },
}
