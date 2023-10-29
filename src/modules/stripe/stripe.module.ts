import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ConfigurableModuleClass } from './stripe.interface'
import { StripeService } from './stripe.service'

@Module({
  imports: [ConfigModule],
  exports: [StripeService],
  providers: [StripeService],
})
export class StripeModule extends ConfigurableModuleClass {}
