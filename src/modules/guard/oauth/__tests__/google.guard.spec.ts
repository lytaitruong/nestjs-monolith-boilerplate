import { AppException } from '@/common'
import { createMock } from '@golevelup/ts-jest'
import { CacheModule } from '@nestjs/cache-manager'
import { ExecutionContext } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { Test, TestingModule } from '@nestjs/testing'
import * as passport from 'passport'
import { Profile } from 'passport-google-oauth20'
import { GUARD_ERROR } from '../../guard.exception'
import { GuardProvider } from '../../guard.interface'
import { configGuard } from '../../guard.module'
import { GoogleOauth2Guard, GoogleStrategy } from '../google.guard'

describe(`GoogleOauth2Guard`, () => {
  let guard: GoogleOauth2Guard
  let strategy: GoogleStrategy

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
      providers: [GoogleStrategy, GoogleOauth2Guard],
    })
      .useMocker(createMock)
      .compile()
    strategy = module.get(GoogleStrategy)
    guard = module.get(GoogleOauth2Guard)
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
    const req = { query: {} }
    const context = createMock<ExecutionContext>()
    const code = jest.fn().mockReturnThis()
    const send = jest.fn().mockReturnThis()
    context.switchToHttp.mockImplementation(() => ({
      getNext: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockImplementation(() => req),
      getResponse: jest.fn().mockImplementation(() => ({
        code,
        send,
        setHeader: () => ({}),
        end: () => ({}),
      })),
    }))
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
      provider: GuardProvider.GOOGLE,
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
      expect(callback).toHaveBeenCalledWith(new AppException(GUARD_ERROR.GOOGLE_OAUTH_INVALID))
    })
    it.each<Partial<Profile>>([
      {
        id: '1',
        displayName: 'michael jordan',
        emails: [
          { verified: 'false', value: '1@gmail.com' },
          { verified: 'true', value: 'michael@gmail.com' },
        ],
        photos: [{ value: 'image.png' }],
      },
      {
        id: '1',
        name: { givenName: 'michael', familyName: 'jordan' },
        emails: [{ verified: 'true', value: 'michael@gmail.com' }],
        photos: [{ value: 'image.png' }],
      },
      {
        id: '1',
        username: 'michael jordan',
        emails: [{ verified: 'true', value: 'michael@gmail.com' }],
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
