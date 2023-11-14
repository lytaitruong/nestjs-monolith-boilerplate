import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { StripeGuard } from '../stripe.guard'
import { StripeModule } from '../stripe.module'
import { StripeService } from '../stripe.service'
import { StripeWebhook } from '../stripe.webhook'

describe(`StripeModule`, () => {
  beforeEach(() => {
    jest.resetModules()
  })
  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })
  it(`should be defined`, async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        StripeModule.forRoot({
          apiKey: process.env.STRIPE_API_KEY,
          options: { apiVersion: '2023-10-16' },
        }),
      ],
    })
      .useMocker(createMock)
      .compile()

    expect(module).toBeDefined()
    expect(module.get(StripeService)).toBeInstanceOf(StripeService)
    expect(module.get(StripeWebhook)).toBeInstanceOf(StripeWebhook)
    expect(module.get(StripeGuard)).toBeInstanceOf(StripeGuard)
  })
})
