import { Route } from '@/app.constant'
import { StripeController } from '@/modules/stripe'
import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Mixin } from 'ts-mixer'
import { WebhookService } from './webhook.service'

@Controller(Route.WEBHOOK)
@ApiTags(Route.WEBHOOK)
export class WebhookController extends Mixin(StripeController) {
  constructor(protected readonly service: WebhookService) {
    super(service)
  }
}
