import { IWebhookService } from '@/api/webhook/webhook.interface'
import { Post, Req, UseGuards } from '@nestjs/common'
import { StripeGuard } from './stripe.guard'
import { IReqStripe } from './stripe.interface'

export abstract class StripeController {
  constructor(protected readonly webhook: IWebhookService<'Stripe'>) {}

  @UseGuards(StripeGuard)
  @Post('stripe')
  async stripeWebhook(@Req() req: IReqStripe) {
    return this.webhook.parseEvent(req.stripe, 'Stripe')
  }
}
