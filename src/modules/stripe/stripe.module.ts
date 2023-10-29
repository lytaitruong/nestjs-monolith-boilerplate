import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ConfigurableModuleClass } from './stripe.interface'
import { StripeService } from './stripe.service'
import { StripeWebhook } from './stripe.webhook'

@Module({
  imports: [ConfigModule],
  exports: [StripeService, StripeWebhook],
  providers: [StripeService, StripeWebhook],
})
export class StripeModule extends ConfigurableModuleClass {}
