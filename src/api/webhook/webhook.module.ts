import { StripeModule } from '@/modules/stripe'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { WebhookController } from './webhook.controller'
import { WebhookService } from './webhook.service'

@Module({
  imports: [
    StripeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        apiKey: config.get<string>('stripe.secretKey'),
        options: { apiVersion: '2023-10-16' },
      }),
    }),
  ],
  exports: [WebhookService],
  providers: [WebhookService],
  controllers: [WebhookController],
})
export class WebhookModule {}
