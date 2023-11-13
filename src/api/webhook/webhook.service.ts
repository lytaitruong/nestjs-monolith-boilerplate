import { PrismaService } from '@/modules/prisma'
import { StripeWebhook } from '@/modules/stripe'
import { Injectable } from '@nestjs/common'
import { IWebhookService, WebhookRes, WebhookTyp } from './webhook.interface'

@Injectable()
export class WebhookService implements IWebhookService<keyof WebhookTyp> {
  constructor(
    private readonly stripe: StripeWebhook,
    private readonly prisma: PrismaService,
  ) {}
  async parseEvent(data: WebhookTyp[keyof WebhookTyp], type: keyof WebhookTyp): Promise<WebhookRes> {
    switch (type) {
      case 'Stripe':
        return this.stripe.parseEvent(data as WebhookTyp['Stripe'])
      default: {
        return null
      }
    }
  }
}
