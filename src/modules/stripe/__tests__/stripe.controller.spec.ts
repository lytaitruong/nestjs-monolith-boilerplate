import { IWebhookService } from '@/api/webhook/webhook.interface'
import { createMock } from '@golevelup/ts-jest'
import { Controller } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { randomUUID } from 'crypto'
import { StripeController as StripeAbstractController } from '../stripe.controller'

@Controller('webhook')
class StripeController extends StripeAbstractController {
  constructor(protected readonly webhook: IWebhookService<'Stripe'>) {
    super(webhook)
  }
}
describe(`StripeController`, () => {
  let controller: StripeController
  // let webhook: StripeWebhook
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [StripeController],
    })
      .useMocker(createMock)
      .compile()

    controller = module.get(StripeController)
  })
  beforeEach(() => {
    jest.resetModules()
  })
  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  it(`should be defined`, () => {
    expect(controller).toBeDefined()
  })

  it(`should response status 200 with data`, async () => {
    const stripe = {
      id: randomUUID(),
      object: 'event',
      api_version: '2023-10-16',
      type: 'account.application.authorized',
      data: {} as any,
      livemode: false,
      pending_webhooks: 0,
      request: null,
      created: Date.now(),
    }
    jest
      .spyOn(controller['webhook'], 'parseEvent')
      .mockResolvedValue({ id: '1', type: 'account.application.authorized', time: Date.now().toString() })

    const response = await controller.stripeWebhook({
      stripe,
    } as any)
    expect.assertions(4)
    expect(controller['webhook'].parseEvent).toHaveBeenCalled()
    expect(controller['webhook'].parseEvent).toHaveBeenCalledTimes(1)
    expect(controller['webhook'].parseEvent).toHaveBeenCalledWith(stripe, 'Stripe')
    expect(response).toEqual({ id: '1', type: 'account.application.authorized', time: expect.any(String) })
  })
})
