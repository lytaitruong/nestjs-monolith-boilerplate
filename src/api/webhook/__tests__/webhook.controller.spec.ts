import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { WebhookController } from '../webhook.controller'

describe(`WebhookController`, () => {
  let controller: WebhookController
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
    })
      .useMocker(createMock)
      .compile()
    controller = module.get(WebhookController)
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
    expect(controller.stripeWebhook).toBeDefined()
  })
})
