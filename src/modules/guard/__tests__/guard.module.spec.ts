import { createMock } from '@golevelup/ts-jest'
import { CacheModule } from '@nestjs/cache-manager'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { GuardModule } from '../guard.module'
import { GuardService } from '../guard.service'
import { GithubStrategy } from '../oauth/github.guard'
import { GoogleStrategy } from '../oauth/google.guard'
import { JwtAccessStrategy } from '../strategies/access.guard'
import { JwtRefreshStrategy } from '../strategies/refresh.guard'

describe(`GuardModule`, () => {
  const ORIGINAL_ENV = process.env

  let config: ConfigService

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...ORIGINAL_ENV }
  })
  afterEach(() => {
    process.env = ORIGINAL_ENV
    jest.resetAllMocks()
    jest.clearAllMocks()
  })
  it.each<[string, object]>([
    [`with environment variable`, ORIGINAL_ENV],
    [
      `without environment variable`,
      {
        ...ORIGINAL_ENV,
        JWT_ACCESS_MAXAGE: undefined,
        JWT_REFRESH_MAXAGE: undefined,
        GOOGLE_SCOPE: undefined,
        GITHUB_SCOPE: undefined,
      },
    ],
  ])(`should be defined %s`, async (content, environment) => {
    process.env = { ...environment }
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
        GuardModule,
      ],
    })
      .useMocker(createMock)
      .compile()
    config = module.get(ConfigService)

    expect(config).toBeDefined()
    expect(module).toBeDefined()
    expect(module.get(JwtAccessStrategy)).toBeInstanceOf(JwtAccessStrategy)
    expect(module.get(JwtRefreshStrategy)).toBeInstanceOf(JwtRefreshStrategy)
    expect(module.get(GoogleStrategy)).toBeInstanceOf(GoogleStrategy)
    expect(module.get(GithubStrategy)).toBeInstanceOf(GithubStrategy)
    expect(module.get(GuardService)).toBeInstanceOf(GuardService)
    expect(config.get('guard')).toEqual({
      jwt: expect.objectContaining({
        accessSecret: process.env.JWT_ACCESS_SECRET,
        accessPublic: process.env.JWT_ACCESS_PUBLIC,
        accessMaxAge: process.env.JWT_ACCESS_MAXAGE ? parseInt(process.env.JWT_ACCESS_MAXAGE) : 900,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        refreshPublic: process.env.JWT_REFRESH_PUBLIC,
        refreshMaxAge: process.env.JWT_REFRESH_MAXAGE ? parseInt(process.env.JWT_REFRESH_MAXAGE) : 2592000,
      }),
      google: expect.objectContaining({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        scope: process.env.GOOGLE_SCOPE ? process.env.GOOGLE_SCOPE.split(',') : [],
      }),
      github: expect.objectContaining({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
        scope: process.env.GITHUB_SCOPE ? process.env.GITHUB_SCOPE.split(',') : [],
      }),
    })
  })
})
