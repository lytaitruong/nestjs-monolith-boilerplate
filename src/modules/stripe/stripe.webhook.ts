import { Inject, Injectable } from '@nestjs/common'
import Stripe from 'stripe'
import { IResStripe, IStripeWebhook, STRIPE_OPTIONS_TOKEN, StripeModuleOptions } from './stripe.interface'

@Injectable()
export class StripeWebhook implements IStripeWebhook {
  private readonly stripe: Stripe
  constructor(@Inject(STRIPE_OPTIONS_TOKEN) private options: StripeModuleOptions) {
    this.stripe = new Stripe(this.options.apiKey, this.options.options)
  }

  get webhook(): Stripe.Webhooks {
    return this.stripe.webhooks
  }

  async parseEvent(data: Stripe.Event): Promise<IResStripe> {
    switch (data.type) {
      case 'payment_intent.payment_failed': {
        break
      }
      case 'payment_intent.partially_funded': {
        break
      }
      case 'payment_intent.canceled': {
        break
      }
      case 'payment_intent.succeeded': {
        break
      }
      default: {
        break
      }
    }
    return { id: data.id, type: data.type, time: new Date().toISOString() }
  }
}
