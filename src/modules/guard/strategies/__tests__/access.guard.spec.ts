import { getContextMock } from '@/__mocks__/context.mock'
import { AppException, IReq } from '@/common'
import { createMock } from '@golevelup/ts-jest'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { SignOptions, sign } from 'jsonwebtoken'
import { GUARD_ERROR, GuardCode } from '../../guard.exception'
import { GuardCookie, JwtInfo } from '../../guard.interface'
import { configGuard } from '../../guard.module'
import { JwtAccessGuard, JwtAccessStrategy } from '../access.guard'

describe(`JwtAccessGuard`, () => {
  let guard: JwtAccessGuard

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ cache: false, load: [configGuard] })],
      providers: [JwtAccessStrategy, JwtAccessGuard],
    })
      .useMocker(createMock)
      .compile()

    guard = module.get(JwtAccessGuard)
  })
  beforeEach(() => {
    jest.resetModules()
  })
  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  const info: JwtInfo = { sub: '1', device: 'iphone15', role: 'user' }
  it(`should be defined`, () => {
    expect(guard).toBeDefined()
  })

  it(`should encrypt jsonwebtoken and return payload info`, async () => {
    const token = await sign(info, process.env.JWT_ACCESS_SECRET, { algorithm: 'RS256', expiresIn: '15m' })
    const req: Pick<IReq, 'cookies' | 'headers' | 'user'> = {
      cookies: { [GuardCookie.ACCESS_TOKEN]: token },
      headers: { authorization: `Bearer ${token}` },
      user: null,
    }
    const code = jest.fn().mockReturnThis()
    const send = jest.fn().mockReturnThis()
    const context = getContextMock(req, { code, send })

    const response = await guard.canActivate(context)
    expect(response).toEqual(true)
    expect(req.user).toEqual({ ...info, iat: expect.any(Number), exp: expect.any(Number) })
  })

  it.each<[GuardCode, string, JwtInfo, options?: SignOptions]>([
    ['ACCESS_TOKEN_CLAIMS_BEFORE', 'NotBeforeError', { ...info }, { notBefore: '1d' }],
    ['ACCESS_TOKEN_EXPIRED', 'TokenExpiredError', { ...info, iat: ((Date.now() - 60 * 60 * 1000) / 1000) | 1000 }, {}],
    ['ACCESS_TOKEN_INVALID', 'JsonWebTokenError', { ...info }, {}],
    ['ACCESS_TOKEN_REQUIRE', 'JsonWebTokenEmpty', { device: 'iphone15' } as JwtInfo, {}],
  ])(`Should throw %s if jsonwebtoken encrypt has error %s`, async (errCode, err, user, options) => {
    const token = await sign(
      user,
      err === 'JsonWebTokenError' ? process.env.JWT_REFRESH_SECRET : process.env.JWT_ACCESS_SECRET,
      { algorithm: 'RS256', expiresIn: '15m', ...options },
    )
    const req: Pick<IReq, 'cookies' | 'headers' | 'user'> = {
      cookies: { [GuardCookie.ACCESS_TOKEN]: token },
      headers: { authorization: `Bearer ${token}` },
      user: null,
    }
    const code = jest.fn().mockReturnThis()
    const send = jest.fn().mockReturnThis()
    const context = getContextMock(req, { code, send })

    expect.assertions(3)
    try {
      await guard.canActivate(context)
    } catch (error) {
      expect(error).toBeInstanceOf(AppException)
      expect(error.error).toEqual(GUARD_ERROR[errCode])
      expect(req.user).toBeNull()
    }
  })
})
