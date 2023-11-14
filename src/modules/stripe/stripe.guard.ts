import { AppException } from '@/common'
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Observable } from 'rxjs'
import { STRIPE_ERROR } from './stripe.exception'
import type { IReqStripe } from './stripe.interface'
import { StripeWebhook } from './stripe.webhook'

@Injectable()
export class StripeGuard implements CanActivate {
  private readonly logger = new Logger(StripeGuard.name)
  private readonly WEBHOOK_KEY: string

  constructor(
    private readonly config: ConfigService,
    private readonly stripe: StripeWebhook,
  ) {
    this.WEBHOOK_KEY = this.config.get<string>('stripe.webhookKey')
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req: IReqStripe = context.switchToHttp().getRequest()

    const signature = req.headers['stripe-signature']
    if (!signature) throw new AppException(STRIPE_ERROR.SIGNATURE_INVALID)

    try {
      const event = this.stripe.webhook.constructEvent(req.rawBody, signature, this.WEBHOOK_KEY)

      req.stripe = event
      return true
    } catch (error) {
      this.logger.error(`Stripe signature failed! ${JSON.stringify(error)}`)
      throw new AppException(STRIPE_ERROR.SIGNATURE_INVALID)
    }
  }
}
