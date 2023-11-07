import type { IAppError } from '@/common'
import { HttpStatus } from '@nestjs/common'

export type UserCode = 'PHONE_EXISTED'

export const USER_ERROR: Record<UserCode, IAppError> = {
  PHONE_EXISTED: {
    code: `3001`,
    message: `This phone has been already registered`,
    status: HttpStatus.CONFLICT,
  },
}
