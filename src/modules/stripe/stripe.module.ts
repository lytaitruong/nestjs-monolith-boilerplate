import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { StripeGuard } from './stripe.guard'
import { ConfigurableModuleClass } from './stripe.interface'
import { StripeService } from './stripe.service'
import { StripeWebhook } from './stripe.webhook'

@Module({
  imports: [ConfigModule],
  exports: [StripeService, StripeWebhook, StripeGuard],
  providers: [StripeService, StripeWebhook, StripeGuard],
})
export class StripeModule extends ConfigurableModuleClass {}
