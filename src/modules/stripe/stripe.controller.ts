import { Post, Req, UseGuards } from '@nestjs/common'
import { StripeGuard } from './stripe.guard'
import { IReqStripe, IStripeWebhook } from './stripe.interface'

export abstract class StripeController {
  constructor(protected readonly webhook: IStripeWebhook) {}

  @UseGuards(StripeGuard)
  @Post('stripe')
  async stripeWebhook(@Req() req: IReqStripe) {
    return this.webhook.parseEvent(req.stripe)
  }
}
