import { CatchErr } from '@/common'
import { Inject, Injectable } from '@nestjs/common'
import Stripe from 'stripe'
import { STRIPE_ERROR } from './stripe.exception'
import { STRIPE_OPTIONS_TOKEN, StripeModuleOptions } from './stripe.interface'

@Injectable()
export class StripeService {
  private readonly stripe: Stripe
  constructor(@Inject(STRIPE_OPTIONS_TOKEN) private options: StripeModuleOptions) {
    this.stripe = new Stripe(this.options.apiKey, this.options.options)
  }

  get webhook(): Stripe.Webhooks {
    return this.stripe.webhooks
  }

  @CatchErr(STRIPE_ERROR.CREATE_CUSTOMER_FAILED)
  async createCustomer(params: Stripe.CustomerCreateParams) {
    const result = await this.stripe.customers.create(params)
    return result
  }

  @CatchErr(STRIPE_ERROR.CREATE_PAYMENT_FAILED)
  async createPaymentIntent(params: Stripe.PaymentIntentCreateParams) {
    const result = await this.stripe.paymentIntents.create(params)
    return result
  }
}
