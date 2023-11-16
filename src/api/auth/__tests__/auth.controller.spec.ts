import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from '../auth.controller'

describe(`AuthController`, () => {
  let controller: AuthController
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .useMocker(createMock)
      .compile()
    controller = module.get(AuthController)
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
    expect(controller.googleAuth).toBeDefined()
    expect(controller.googleRedirect).toBeDefined()
    expect(controller.githubAuth).toBeDefined()
    expect(controller.githubRedirect).toBeDefined()
    expect(controller.signOut).toBeDefined()
    expect(controller.refreshToken).toBeDefined()
  })
})
