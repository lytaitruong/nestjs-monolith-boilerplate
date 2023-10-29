import { IAppError } from '@/common'
import { HttpStatus } from '@nestjs/common'

export type StripeCode = 'CREATE_CUSTOMER_FAILED' | 'CREATE_PAYMENT_FAILED'

export const STRIPE_ERROR: Record<StripeCode, IAppError> = {
  CREATE_CUSTOMER_FAILED: {
    code: `0800`,
    message: `Stripe create customer has been failed`,
    status: HttpStatus.FAILED_DEPENDENCY,
  },
  CREATE_PAYMENT_FAILED: {
    code: `0801`,
    message: `Stripe create payment has been failed`,
    status: HttpStatus.FAILED_DEPENDENCY,
  },
}
