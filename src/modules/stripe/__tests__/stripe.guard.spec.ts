import { getContextMock } from '@/__mocks__/context.mock'
import { AppException } from '@/common'
import { createMock } from '@golevelup/ts-jest'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { randomUUID } from 'crypto'
import { STRIPE_ERROR } from '../stripe.exception'
import { StripeGuard } from '../stripe.guard'
import { STRIPE_OPTIONS_TOKEN } from '../stripe.interface'
import { StripeWebhook } from '../stripe.webhook'

describe(`StripeGuard`, () => {
  let guard: StripeGuard
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          cache: false,
          load: [() => ({ stripe: { webhookKey: process.env.STRIPE_WEBHOOK_KEY } })],
        }),
      ],
      providers: [
        StripeWebhook,
        StripeGuard,
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
    guard = module.get(StripeGuard)
  })
  beforeEach(() => {
    jest.resetModules()
  })
  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  it(`should be defined`, () => {
    expect(guard).toBeDefined()
  })

  describe(`canActivate`, () => {
    const req: { rawBody: Buffer; headers: object; body: object; stripe?: object } = {
      rawBody: Buffer.from('rawBody'),
      headers: { 'stripe-signature': 'stripe-signature' },
      body: { livemode: false },
    }
    it(`should throw SIGNATURE_INVALID with code 800 when stripe-signature in header is empty`, async () => {
      jest.spyOn(guard['logger'], 'error').mockImplementation(() => ({}))
      jest.spyOn(guard['stripe'].webhook, 'constructEvent')

      const code = jest.fn().mockReturnThis()
      const send = jest.fn().mockReturnThis()
      const context = getContextMock({ headers: {} }, { code, send })
      expect.assertions(4)
      try {
        await guard.canActivate(context)
      } catch (error) {
        expect(guard['logger'].error).not.toHaveBeenCalled()
        expect(guard['stripe'].webhook.constructEvent).not.toHaveBeenCalled()
        expect(error).toBeInstanceOf(AppException)
        expect(error.error).toEqual(STRIPE_ERROR.SIGNATURE_INVALID)
      }
    })

    it(`should throw SIGNATURE_INVALID with code 800 when stripe-signature is invalid`, async () => {
      jest.spyOn(guard['logger'], 'error').mockImplementation(() => ({}))
      jest.spyOn(guard['stripe'].webhook, 'constructEvent').mockImplementation(() => {
        throw new Error('Stripe Signature Invalid')
      })
      const code = jest.fn().mockReturnThis()
      const send = jest.fn().mockReturnThis()
      const context = getContextMock(req, { code, send })
      expect.assertions(6)
      try {
        await guard.canActivate(context)
      } catch (error) {
        expect(guard['logger'].error).toHaveBeenCalled()
        expect(guard['stripe'].webhook.constructEvent).toHaveBeenCalled()
        expect(guard['stripe'].webhook.constructEvent).toHaveBeenCalledTimes(1)
        expect(guard['stripe'].webhook.constructEvent).toHaveBeenCalledWith(
          req.rawBody,
          req.headers['stripe-signature'],
          process.env.STRIPE_WEBHOOK_KEY,
        )
        expect(error).toBeInstanceOf(AppException)
        expect(error.error).toEqual(STRIPE_ERROR.SIGNATURE_INVALID)
      }
    })

    it(`should return true and req.stripe receive event`, async () => {
      jest.spyOn(guard['logger'], 'error').mockImplementation(() => ({}))
      jest.spyOn(guard['stripe'].webhook, 'constructEvent').mockImplementation(() => ({
        id: randomUUID(),
        object: 'event',
        api_version: '2023-10-16',
        type: 'account.application.authorized',
        data: {} as any,
        livemode: false,
        pending_webhooks: 0,
        request: null,
        created: Date.now(),
      }))

      const code = jest.fn().mockReturnThis()
      const send = jest.fn().mockReturnThis()
      const context = getContextMock(req, { code, send })

      const response = await guard.canActivate(context)

      expect.assertions(7)
      expect(response).toEqual(true)
      expect(guard['logger'].error).not.toHaveBeenCalled()
      expect(guard['stripe'].webhook.constructEvent).toHaveBeenCalled()
      expect(guard['stripe'].webhook.constructEvent).toHaveBeenCalledTimes(1)
      expect(guard['stripe'].webhook.constructEvent).toHaveBeenCalledWith(
        req.rawBody,
        req.headers['stripe-signature'],
        process.env.STRIPE_WEBHOOK_KEY,
      )
      expect(req.stripe).toBeDefined()
      expect(req.stripe).toBeTruthy()
    })
  })
})
