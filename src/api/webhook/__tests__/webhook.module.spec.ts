import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { WebhookController } from '../webhook.controller'
import { WebhookModule } from '../webhook.module'
import { WebhookService } from '../webhook.service'

describe(`WebhookModule`, () => {
  beforeEach(() => {
    jest.resetModules()
  })
  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  it(`should be defined`, async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [WebhookModule],
    })
      .useMocker(createMock)
      .compile()

    expect(module).toBeDefined()
    expect(module.get(WebhookService)).toBeDefined()
    expect(module.get(WebhookController)).toBeDefined()
  })
})
