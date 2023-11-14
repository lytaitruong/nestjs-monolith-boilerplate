import { createMock } from '@golevelup/ts-jest'
import { ConfigModule } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { randomUUID } from 'crypto'
import { JwtInfo } from '../guard.interface'
import { configGuard } from '../guard.module'
import { GuardService } from '../guard.service'

describe(`GuardService`, () => {
  let service: GuardService
  let jwt: JwtService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ cache: false, load: [configGuard] })],
      providers: [JwtService, GuardService],
    })
      .useMocker(createMock)
      .compile()

    service = module.get(GuardService)
    jwt = module.get(JwtService)
  })
  beforeEach(() => {
    jest.resetModules()
  })
  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  it(`should be defined`, () => {
    expect(service).toBeDefined()
    expect(service.maxAgeAccess).toEqual(+process.env.JWT_ACCESS_MAXAGE)
    expect(service.maxAgeRefresh).toEqual(+process.env.JWT_REFRESH_MAXAGE)
  })

  describe(`signed`, () => {
    const info: JwtInfo = {
      sub: randomUUID(),
      device: 'Iphone 15',
      role: 'USER',
    }
    it(`should signed and return jwt access token`, async () => {
      const response = await service.signed('access', info)

      const encrypt = await jwt.verifyAsync(response, { algorithms: ['RS256'], secret: process.env.JWT_ACCESS_SECRET })

      expect(response).toEqual(expect.any(String))
      expect(encrypt).toEqual({
        ...info,
        iat: expect.any(Number),
        exp: expect.any(Number),
        jti: expect.any(String),
      })
    })

    it(`should signed and return jwt refresh token`, async () => {
      const response = await service.signed('refresh', info)

      const encrypt = await jwt.verifyAsync(response, { algorithms: ['RS256'], secret: process.env.JWT_REFRESH_SECRET })

      expect(response).toEqual(expect.any(String))
      expect(encrypt).toEqual({
        ...info,
        iat: expect.any(Number),
        exp: expect.any(Number),
        jti: expect.any(String),
      })
    })
  })
})
