import { Test, TestingModule } from '@nestjs/testing'
import { AppController } from '../app.controller'

describe('AppController', () => {
  let controller: AppController

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile()

    controller = app.get<AppController>(AppController)
  })

  describe('GET healthcheck', () => {
    it('should return "Ping!"', () => {
      expect(controller.getHealthcheck()).toBe('Ping!')
    })
  })
})
