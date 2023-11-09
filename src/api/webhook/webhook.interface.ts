import type { IResStripe, StripeData } from '@/modules/stripe/stripe.interface'

export type WebhookTyp = {
  Stripe: StripeData
}
export type WebhookRes = IResStripe

export interface IWebhookService<T extends keyof WebhookTyp> {
  parseEvent(data: WebhookTyp[T], type: T): Promise<WebhookRes>
}
