import { IResStripe, IStripeWebhook } from '@/modules/stripe/stripe.interface'
import { StripeWebhook } from '@/modules/stripe/stripe.webhook'
import { Injectable } from '@nestjs/common'
import Stripe from 'stripe'

@Injectable()
export class WebhookService implements IStripeWebhook {
  constructor(private readonly stripe: StripeWebhook) {}

  async parseEvent(data: Stripe.Event): Promise<IResStripe> {
    return this.stripe.parseEvent(data)
  }
}
