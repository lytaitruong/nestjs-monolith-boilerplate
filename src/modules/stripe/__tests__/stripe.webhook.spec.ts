import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { randomUUID } from 'crypto'
import Stripe from 'stripe'
import { STRIPE_OPTIONS_TOKEN } from '../stripe.interface'
import { StripeWebhook } from '../stripe.webhook'

describe(`StripeWebhook`, () => {
  let webhook: StripeWebhook

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeWebhook,
        {
          provide: STRIPE_OPTIONS_TOKEN,
          useFactory: () => ({
            apiKey: process.env.STRIPE_API_KEY,
            options: { apiVersion: '2023-10-16' },
          }),
        },
      ],
    })
      .useMocker(createMock)
      .compile()

    webhook = module.get(StripeWebhook)
  })
  beforeEach(() => {
    jest.resetModules()
  })
  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  it(`should be defined`, () => {
    expect(webhook).toBeDefined()
    expect(webhook.webhook).toBeTruthy()
    expect(webhook['stripe']).toBeDefined()
  })

  it.each<[Stripe.WebhookEndpointCreateParams.EnabledEvent, boolean]>([
    ['payment_intent.canceled', true],
    ['payment_intent.succeeded', true],
    ['payment_intent.partially_funded', false],
  ])(`Webhook should parseEvent type %s`, async (type, isExecute) => {
    jest.spyOn(webhook['logger'], 'log').mockImplementation(() => ({}))

    const id = randomUUID()
    const response = await webhook.parseEvent({
      object: 'event',
      livemode: false,
      id,
      type: type as any,
      data: {} as any,
      pending_webhooks: 0,
      api_version: '2023-10-16',
      created: Date.now(),
      request: null,
    })

    expect.assertions(3)
    expect(response).toEqual({ id, type, time: expect.any(String) })
    if (isExecute) {
      expect(webhook['logger'].log).toHaveBeenCalled()
      expect(webhook['logger'].log).toHaveBeenCalledTimes(1)
    } else {
      expect(webhook['logger'].log).not.toHaveBeenCalled()
      expect(webhook['logger'].log).toHaveBeenCalledTimes(0)
    }
  })
})
