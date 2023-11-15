import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { StripeService, StripeWebhook } from '.'
import { StripeGuard } from './stripe.guard'
import { ConfigurableModuleClass } from './stripe.interface'

@Module({
  imports: [ConfigModule],
  exports: [StripeService, StripeWebhook, StripeGuard],
  providers: [StripeService, StripeWebhook, StripeGuard],
})
export class StripeModule extends ConfigurableModuleClass {}
