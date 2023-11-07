import { ConfigurableModuleBuilder } from '@nestjs/common'
import type { FastifyRequest } from 'fastify'
import type { FastifyRequestType } from 'fastify/types/type-provider'
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
export type StripeData = Stripe.Event

export interface IReqStripe extends FastifyRequest {
  stripe: StripeData
  body: FastifyRequestType['body'] & { livemode: boolean }
  headers: FastifyRequestType['headers'] & { 'stripe-signature': string }
  rawBody: Buffer
}

export interface IResStripe {
  id: string
  type: Stripe.Event.Type
  time: string
}
