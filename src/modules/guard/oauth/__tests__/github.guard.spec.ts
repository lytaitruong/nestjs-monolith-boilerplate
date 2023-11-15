import { getContextMock } from '@/__mocks__/context.mock'
import { AppException } from '@/common'
import { createMock } from '@golevelup/ts-jest'
import { CacheModule } from '@nestjs/cache-manager'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { Test, TestingModule } from '@nestjs/testing'
import * as passport from 'passport'
import { Profile } from 'passport-github2'
import { GUARD_ERROR } from '../../guard.exception'
import { GuardProvider } from '../../guard.interface'
import { configGuard } from '../../guard.module'
import { GithubOauth2Guard, GithubStrategy } from '../github.guard'

describe(`GithubOauth2Guard`, () => {
  let guard: GithubOauth2Guard
  let strategy: GithubStrategy

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ cache: false, load: [configGuard] }),
        PassportModule.register({ session: false }),
        CacheModule.register({
          isGlobal: true,
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: () => {
            return {}
          },
        }),
      ],
      providers: [GithubStrategy, GithubOauth2Guard],
    })
      .useMocker(createMock)
      .compile()
    strategy = module.get(GithubStrategy)
    guard = module.get(GithubOauth2Guard)
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
    expect(strategy).toBeDefined()
  })

  it(`should encrypt jsonwebtoken and return payload info`, async () => {
    const code = jest.fn().mockReturnThis()
    const send = jest.fn().mockReturnThis()
    const setHeader = jest.fn().mockImplementation(() => ({}))
    const end = jest.fn().mockImplementation(() => ({}))
    const context = getContextMock({ query: {} }, { code, send, setHeader, end })

    jest.spyOn(passport, 'authenticate').mockImplementation((type, options, callback) => () => {
      callback(null, { profile: true })
    })
    const response = await guard.canActivate(context)
    expect(passport.authenticate).toHaveBeenCalledTimes(1)
    expect(response).toEqual(true)
  })

  describe(`validate`, () => {
    const accessToken = 'accessToken'
    const refreshToken = 'refreshToken'
    const info = {
      oauth2: { id: '1', accessToken, refreshToken },
      provider: GuardProvider.GITHUB,
      name: 'michael jordan',
      email: 'michael@gmail.com',
      image: 'image.png',
    }
    it(`should throw error when profile is empty`, async () => {
      const profile = null
      const callback = jest.fn()
      await strategy.validate(accessToken, refreshToken, profile, callback)

      expect.assertions(2)
      expect(callback).toBeCalledTimes(1)
      expect(callback).toHaveBeenCalledWith(new AppException(GUARD_ERROR.GITHUB_OAUTH_INVALID))
    })
    it.each<Partial<Profile>>([
      {
        id: '1',
        displayName: 'michael jordan',
        emails: [{ value: 'michael@gmail.com' }],
        photos: [{ value: 'image.png' }],
      },
      {
        id: '1',
        name: { givenName: 'michael', familyName: 'jordan' },
        emails: [{ value: 'michael@gmail.com' }],
        photos: [{ value: 'image.png' }],
      },
      {
        id: '1',
        username: 'michael jordan',
        emails: [{ value: 'michael@gmail.com' }],
        photos: [{ value: 'image.png' }],
      },
    ])(`should return profile when profile not empty`, async (profile) => {
      const callback = jest.fn()
      await strategy.validate('accessToken', 'refreshToken', profile as Profile, callback)

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith(null, info)
    })
  })
})
