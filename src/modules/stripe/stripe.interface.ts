import { ConfigurableModuleBuilder } from '@nestjs/common'
import { FastifyRequest } from 'fastify'
import { FastifyRequestType } from 'fastify/types/type-provider'
import Stripe from 'stripe'

export interface StripeModuleOptions {
  apiKey: string
  options: Stripe.StripeConfig
}

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN: STRIPE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<StripeModuleOptions>().setClassMethodName('forRoot').build()
//--------------------------------------------------------------
//--------------------------------------------------------------
//--------------------------------------------------------------
export interface IStripeWebhook {
  parseEvent(data: Stripe.Event): Promise<IResStripe>
}

export interface IReqStripe extends FastifyRequest {
  stripe: Stripe.Event
  body: FastifyRequestType['body'] & { livemode: boolean }
  headers: FastifyRequestType['headers'] & { 'stripe-signature': string }
  rawBody: Buffer
}

export interface IResStripe {
  id: string
  type: Stripe.Event.Type
  time: string
}
