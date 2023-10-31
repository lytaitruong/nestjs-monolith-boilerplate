import { IWebhookService } from '@/api/webhook/webhook.interface'
import { Inject, Injectable, Logger } from '@nestjs/common'
import Stripe from 'stripe'
import { PrismaService } from '../prisma'
import { IResStripe, STRIPE_OPTIONS_TOKEN, StripeData, StripeModuleOptions } from './stripe.interface'

@Injectable()
export class StripeWebhook implements IWebhookService<'Stripe'> {
  private readonly logger = new Logger(StripeWebhook.name)
  private readonly stripe: Stripe
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STRIPE_OPTIONS_TOKEN) private options: StripeModuleOptions,
  ) {
    this.stripe = new Stripe(this.options.apiKey, this.options.options)
  }

  get webhook(): Stripe.Webhooks {
    return this.stripe.webhooks
  }

  async parseEvent(data: StripeData): Promise<IResStripe> {
    switch (data.type) {
      case 'payment_intent.canceled':
        await this.exePaymentIntentCanceled(data.data)
        break
      case 'payment_intent.succeeded':
        await this.exePaymentIntentSucceeded(data.data)
        break
    }
    return { id: data.id, type: data.type, time: new Date().toISOString() }
  }

  async exePaymentIntentCanceled(data: Stripe.PaymentIntentCanceledEvent.Data) {
    this.logger.log('data', data)
    // implement logic in here
  }

  async exePaymentIntentSucceeded(data: Stripe.PaymentIntentSucceededEvent.Data) {
    this.logger.log('data', data)
    // implement logic in here
  }
}
