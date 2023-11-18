import { StripeWebhook } from '@/modules/stripe'
import { IResStripe } from '@/modules/stripe/stripe.interface'
import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { WebhookService } from '../webhook.service'

describe(`WebhookService`, () => {
  let service: WebhookService
  let stripe: StripeWebhook

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebhookService],
    })
      .useMocker(createMock)
      .compile()

    service = module.get(WebhookService)
    stripe = module.get(StripeWebhook)
  })
  beforeEach(() => {
    jest.resetModules()
  })
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it(`should be defined`, () => {
    expect(service).toBeDefined()
    expect(stripe).toBeDefined()
  })

  describe(`parseEvent`, () => {
    it(`Should parseEvent to %s`, async () => {
      const data = { id: 'stripe', type: 'account.application.authorized', time: new Date().toISOString() }
      jest.spyOn(stripe, 'parseEvent').mockResolvedValue(data as IResStripe)

      const response = await service.parseEvent({ data: { type: 'Stripe' } } as any, 'Stripe')

      expect.assertions(3)
      expect(stripe.parseEvent).toHaveBeenCalledTimes(1)
      expect(stripe.parseEvent).toHaveBeenCalledWith({ data: { type: 'Stripe' } })
      expect(response).toEqual(data)
    })

    it(`Should not parseEvent and return null if not match WebhookTyp`, async () => {
      jest.spyOn(stripe, 'parseEvent').mockResolvedValue(null)

      const response = await service.parseEvent({ data: { type: 'default' } } as any, 'default' as any)

      expect.assertions(2)
      expect(stripe.parseEvent).not.toHaveBeenCalled()
      expect(response).toEqual(null)
    })
  })
})
