import { createMock } from '@golevelup/ts-jest'
import { CacheModule } from '@nestjs/cache-manager'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from '../auth.controller'
import { AuthModule } from '../auth.module'
import { AuthService } from '../auth.service'

describe(`AuthModule`, () => {
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
        CacheModule.register({
          isGlobal: true,
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: () => {
            return {}
          },
        }),
        AuthModule,
      ],
    })
      .useMocker(createMock)
      .compile()

    expect(module).toBeDefined()
    expect(module.get(AuthService)).toBeDefined()
    expect(module.get(AuthController)).toBeDefined()
  })
})
