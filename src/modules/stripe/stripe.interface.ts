import { ConfigurableModuleBuilder } from '@nestjs/common'
import Stripe from 'stripe'

export interface StripeModuleOptions {
  apiKey: string
  options: Stripe.StripeConfig
}

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN: STRIPE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<StripeModuleOptions>().setClassMethodName('forRoot').build()
