import { AppException, IReq, IRes } from '@/common'
import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { Controller, Inject } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { IDevice } from 'ua-parser-js'
import { getOauth2Info } from '../__mocks__/guard.mock'
import { GuardController } from '../guard.controller'
import { GUARD_ERROR } from '../guard.exception'
import { GuardCookie, GuardProvider, IGuardService, IReqOauth2, JwtInfo } from '../guard.interface'
import { configGuard } from '../guard.module'

const TEST_SERVICE_TOKEN = 'TEST_SERVICE_TOKEN'
@Controller()
class TestGuardController extends GuardController {
  constructor(
    @Inject(TEST_SERVICE_TOKEN) protected readonly service: IGuardService,
    protected readonly config: ConfigService,
  ) {
    super(service, config)
  }
}

describe(`GuardController`, () => {
  let controller: TestGuardController
  let service: DeepMocked<IGuardService>

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ cache: false, load: [configGuard] })],
      controllers: [TestGuardController],
      providers: [
        {
          provide: TEST_SERVICE_TOKEN,
          useValue: createMock<IGuardService>(),
        },
      ],
    })
      .useMocker(createMock)
      .compile()

    controller = module.get(TestGuardController)
    service = module.get(TEST_SERVICE_TOKEN)
  })
  beforeEach(() => {
    jest.resetModules()
  })
  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  it(`should be defined`, async () => {
    expect(controller).toBeDefined()
  })

  describe(`POST signOut`, () => {
    it(`should return status 204 without response, remove cookie access and refresh token`, async () => {
      const user = { sub: '1', role: 'user', device: 'iphone15', iat: Date.now(), exp: Date.now() }
      const req = createMock<IReq<JwtInfo>>({ user })
      const res = createMock<IRes>({
        setCookie: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        code: jest.fn().mockReturnThis(),
      })
      jest.spyOn(service, 'signOut').mockResolvedValue()

      await controller.signOut(req, res)

      expect.assertions(5)
      expect(service.signOut).toHaveBeenCalledTimes(1)
      expect(service.signOut).toHaveBeenCalledWith(user)

      expect(res.setCookie).toHaveBeenCalledTimes(2)
      expect(res.setCookie).toHaveBeenNthCalledWith(1, GuardCookie.ACCESS_TOKEN, '', { maxAge: -1 })
      expect(res.setCookie).toHaveBeenNthCalledWith(2, GuardCookie.REFRESH_TOKEN, '', { maxAge: -1 })
    })
  })

  describe(`POST refreshToken`, () => {
    it(`should return status 200 and replace access token with refresh token`, async () => {
      const user = { sub: '1', role: 'user', device: 'iphone15', iat: Date.now(), exp: Date.now() }
      const req = createMock<IReq<JwtInfo>>({ user, headers: { authorization: `Bearer oldRefreshToken` } })
      const res = createMock<IRes>({
        setCookie: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        code: jest.fn().mockReturnThis(),
      })
      jest.spyOn(service, 'refreshToken').mockResolvedValue({
        type: 'Bearer',
        accessToken: 'accessToken',
        refreshToken: 'newRefreshToken',
      })

      await controller.refreshToken(req, res)

      expect.assertions(5)
      expect(service.refreshToken).toHaveBeenCalledTimes(1)
      expect(service.refreshToken).toHaveBeenCalledWith(user, 'oldRefreshToken', expect.any(Number))

      expect(res.setCookie).toHaveBeenCalledTimes(2)
      expect(res.setCookie).toHaveBeenNthCalledWith(1, GuardCookie.ACCESS_TOKEN, 'accessToken', {
        maxAge: expect.any(Number),
      })
      expect(res.setCookie).toHaveBeenNthCalledWith(2, GuardCookie.REFRESH_TOKEN, 'newRefreshToken', {
        maxAge: expect.any(Number),
      })
    })
  })

  describe(`POST githubRedirect`, () => {
    const device = { type: `mobile`, vendor: `Intel`, model: `Mac OS X 10_15_7` }
    const user = getOauth2Info(GuardProvider.GITHUB, 'githubAccessToken', 'githubRefreshToken')
    it.each<any>([null, undefined, false, 0])(`should throw OAUTH2_STATE_INVALID if req.state is %s`, async (state) => {
      const req = createMock<IReqOauth2>({ state, user })
      const res = createMock<IRes>({
        setCookie: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        code: jest.fn().mockReturnThis(),
      })
      jest.spyOn(service, 'oauth2')
      try {
        await controller.githubRedirect(req, device as IDevice, res)
      } catch (error) {
        expect(service.oauth2).not.toHaveBeenCalled()
        expect(res.setCookie).not.toHaveBeenCalled()
        expect(res.send).not.toHaveBeenCalled()
        expect(error).toBeInstanceOf(AppException)
        expect(error.error).toEqual(GUARD_ERROR.OAUTH2_STATE_INVALID)
      }
    })

    it(`should return status 200 with access and refresh token`, async () => {
      const req = createMock<IReqOauth2>({ state: true, user })
      const res = createMock<IRes>({
        setCookie: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        code: jest.fn().mockReturnThis(),
      })
      jest.spyOn(service, 'oauth2').mockResolvedValue({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      })

      await controller.githubRedirect(req, device as IDevice, res)

      expect.assertions(5)
      expect(service.oauth2).toHaveBeenCalledTimes(1)
      expect(service.oauth2).toHaveBeenCalledWith(user, device)

      expect(res.setCookie).toHaveBeenCalledTimes(2)
      expect(res.setCookie).toHaveBeenNthCalledWith(1, GuardCookie.ACCESS_TOKEN, 'accessToken', {
        maxAge: expect.any(Number),
      })
      expect(res.setCookie).toHaveBeenNthCalledWith(2, GuardCookie.REFRESH_TOKEN, 'refreshToken', {
        maxAge: expect.any(Number),
      })
    })
  })

  describe(`POST googleRedirect`, () => {
    const device = { type: `mobile`, vendor: `Intel`, model: `Mac OS X 10_15_7` }
    const user = getOauth2Info(GuardProvider.GOOGLE, 'googleAccessToken', 'googleRefreshToken')
    it.each<any>([null, undefined, false, 0])(`should throw OAUTH2_STATE_INVALID if req.state is %s`, async (state) => {
      const req = createMock<IReqOauth2>({ state, user })
      const res = createMock<IRes>({
        setCookie: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        code: jest.fn().mockReturnThis(),
      })
      jest.spyOn(service, 'oauth2')
      try {
        await controller.googleRedirect(req, device as IDevice, res)
      } catch (error) {
        expect(service.oauth2).not.toHaveBeenCalled()
        expect(res.setCookie).not.toHaveBeenCalled()
        expect(res.send).not.toHaveBeenCalled()
        expect(error).toBeInstanceOf(AppException)
        expect(error.error).toEqual(GUARD_ERROR.OAUTH2_STATE_INVALID)
      }
    })

    it(`should return status 200 with access and refresh token`, async () => {
      const req = createMock<IReqOauth2>({ state: true, user })
      const res = createMock<IRes>({
        setCookie: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        code: jest.fn().mockReturnThis(),
      })
      jest.spyOn(service, 'oauth2').mockResolvedValue({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      })

      await controller.googleRedirect(req, device as IDevice, res)

      expect.assertions(5)
      expect(service.oauth2).toHaveBeenCalledTimes(1)
      expect(service.oauth2).toHaveBeenCalledWith(user, device)

      expect(res.setCookie).toHaveBeenCalledTimes(2)
      expect(res.setCookie).toHaveBeenNthCalledWith(1, GuardCookie.ACCESS_TOKEN, 'accessToken', {
        maxAge: expect.any(Number),
      })
      expect(res.setCookie).toHaveBeenNthCalledWith(2, GuardCookie.REFRESH_TOKEN, 'refreshToken', {
        maxAge: expect.any(Number),
      })
    })
  })
})
