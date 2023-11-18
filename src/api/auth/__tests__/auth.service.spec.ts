import { AppException } from '@/common'
import * as crypto from '@/common/common.crypto'
import { GuardService, JwtInfo } from '@/modules/guard'
import { PrismaService } from '@/modules/prisma'
import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { randomUUID } from 'crypto'
import { AUTH_ERROR } from '../auth.exception'
import { AuthService } from '../auth.service'

describe(`AuthService`, () => {
  let service: AuthService
  let prisma: PrismaService
  let guard: GuardService
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    })
      .useMocker(createMock)
      .compile()
    guard = module.get(GuardService)
    service = module.get(AuthService)
    prisma = module.get(PrismaService)
  })
  beforeEach(() => {
    jest.resetModules()
  })
  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })
  const info: JwtInfo = {
    sub: randomUUID(),
    device: 'Iphone 15',
    role: 'USER',
    exp: Date.now(),
    iat: Date.now(),
  }
  it(`should be defined`, () => {
    expect(service).toBeDefined()
  })

  describe(`isDeviceExistAndActive`, () => {
    it(`should throw DEVICE_NOT_FOUND if info device and token in database not found`, async () => {
      prisma.auth.findUnique = jest.fn().mockResolvedValue(null)

      expect.assertions(4)
      try {
        await service['isDeviceExistAndActive'](info)
      } catch (error) {
        expect(prisma.auth.findUnique).toHaveBeenCalledTimes(1)
        expect(prisma.auth.findUnique).toHaveBeenCalledWith({
          where: { userId_device: { userId: info.sub, device: info.device } },
          select: { refreshToken: true, user: { select: { status: true } } },
        })
        expect(error).toBeInstanceOf(AppException)
        expect(error.error).toEqual(AUTH_ERROR.DEVICE_NOT_FOUND)
      }
    })

    it(`should throw USER_HAS_BEEN_DEACTIVATE if user has been deactivate`, async () => {
      prisma.auth.findUnique = jest.fn().mockResolvedValue({
        refreshToken: 'refreshToken',
        user: { status: 'DEACTIVATE' },
      })

      expect.assertions(4)
      try {
        await service['isDeviceExistAndActive'](info)
      } catch (error) {
        expect(prisma.auth.findUnique).toHaveBeenCalledTimes(1)
        expect(prisma.auth.findUnique).toHaveBeenCalledWith({
          where: { userId_device: { userId: info.sub, device: info.device } },
          select: { refreshToken: true, user: { select: { status: true } } },
        })
        expect(error).toBeInstanceOf(AppException)
        expect(error.error).toEqual(AUTH_ERROR.USER_HAS_BEEN_DEACTIVATE)
      }
    })

    it(`should return refreshToken and user status`, async () => {
      prisma.auth.findUnique = jest.fn().mockResolvedValue({
        refreshToken: 'refreshToken',
        user: { status: 'ACTIVE' },
      })

      const response = await service['isDeviceExistAndActive'](info)

      expect(prisma.auth.findUnique).toHaveBeenCalledTimes(1)
      expect(prisma.auth.findUnique).toHaveBeenCalledWith({
        where: { userId_device: { userId: info.sub, device: info.device } },
        select: { refreshToken: true, user: { select: { status: true } } },
      })
      expect(response).toEqual({
        refreshToken: 'refreshToken',
        user: { status: 'ACTIVE' },
      })
    })
  })

  describe(`signOut`, () => {
    afterEach(() => {
      jest.clearAllMocks()
    })
    it(`should return 200 with data token has been revoked`, async () => {
      service['isDeviceExistAndActive'] = jest.fn().mockResolvedValue({
        refreshToken: 'refreshToken',
        user: { status: true },
      })
      prisma.auth.update = jest.fn().mockResolvedValue({ userId: info.sub })

      const response = await service.signOut(info)

      expect(service['isDeviceExistAndActive']).toHaveBeenCalledTimes(1)
      expect(service['isDeviceExistAndActive']).toHaveBeenCalledWith(info)
      expect(prisma.auth.update).toHaveBeenCalledTimes(1)
      expect(prisma.auth.update).toHaveBeenCalledWith({
        where: { userId_device: { userId: info.sub, device: info.device } },
        data: { refreshToken: null },
        select: { userId: true },
      })
      expect(response).toBeUndefined()
    })
  })

  describe(`refreshToken`, () => {
    afterEach(() => {
      jest.clearAllMocks()
    })
    it(`should throw REFRESH_TOKEN_REVOKED if refreshToken is empty`, async () => {
      service['isDeviceExistAndActive'] = jest.fn().mockResolvedValue({ refreshToken: null })
      jest.spyOn(crypto, 'scryptVerify')
      jest.spyOn(guard, 'signed')
      jest.spyOn(prisma.auth, 'update')

      expect.assertions(7)
      try {
        await service.refreshToken(info, 'refreshToken', 100)
      } catch (error) {
        expect(service['isDeviceExistAndActive']).toHaveBeenCalledTimes(1)
        expect(service['isDeviceExistAndActive']).toHaveBeenCalledWith(info)
        expect(crypto.scryptVerify).not.toHaveBeenCalled()
        expect(guard.signed).not.toHaveBeenCalled()
        expect(prisma.auth.update).not.toHaveBeenCalled()
        expect(error).toBeInstanceOf(AppException)
        expect(error.error).toEqual(AUTH_ERROR.REFRESH_TOKEN_REVOKED)
      }
    })

    it(`should throw REFRESH_TOKEN_REVOKED if refreshToken verified false`, async () => {
      service['isDeviceExistAndActive'] = jest.fn().mockResolvedValue({ refreshToken: 'refreshTokenHash' })
      jest.spyOn(crypto, 'scryptVerify').mockResolvedValue(false)
      jest.spyOn(guard, 'signed')
      jest.spyOn(prisma.auth, 'update')

      expect.assertions(8)
      try {
        await service.refreshToken(info, 'refreshToken', 100)
      } catch (error) {
        expect(service['isDeviceExistAndActive']).toHaveBeenCalledTimes(1)
        expect(service['isDeviceExistAndActive']).toHaveBeenCalledWith(info)
        expect(crypto.scryptVerify).toHaveBeenCalledTimes(1)
        expect(crypto.scryptVerify).toHaveBeenCalledWith('refreshToken', 'refreshTokenHash')
        expect(guard.signed).not.toHaveBeenCalled()
        expect(prisma.auth.update).not.toHaveBeenCalled()
        expect(error).toBeInstanceOf(AppException)
        expect(error.error).toEqual(AUTH_ERROR.REFRESH_TOKEN_REVOKED)
      }
    })

    it(`should return 200 with data token has been updated`, async () => {
      service['isDeviceExistAndActive'] = jest.fn().mockResolvedValue({
        refreshToken: 'refreshTokenHash',
        user: { status: true },
      })
      jest.spyOn(crypto, 'scryptVerify').mockResolvedValue(true)
      jest.spyOn(crypto, 'scryptHash').mockResolvedValue('newRefreshTokenHash')
      jest.spyOn(guard, 'signed').mockResolvedValueOnce('newAccessToken').mockResolvedValueOnce('newRefreshToken')
      prisma.auth.update = jest.fn().mockResolvedValue({ userId: info.sub })

      const response = await service.refreshToken(info, 'refreshToken', 100)

      expect(service['isDeviceExistAndActive']).toHaveBeenCalledTimes(1)
      expect(service['isDeviceExistAndActive']).toHaveBeenCalledWith(info)
      expect(crypto.scryptVerify).toHaveBeenCalledTimes(1)
      expect(crypto.scryptVerify).toHaveBeenCalledWith('refreshToken', 'refreshTokenHash')
      expect(crypto.scryptHash).toHaveBeenCalledTimes(1)
      expect(crypto.scryptHash).toHaveBeenCalledWith('newRefreshToken')
      expect(prisma.auth.update).toHaveBeenCalledTimes(1)
      expect(prisma.auth.update).toHaveBeenCalledWith({
        where: { userId_device: { userId: info.sub, device: info.device } },
        data: { refreshToken: 'newRefreshTokenHash' },
        select: { userId: true },
      })
      expect(response).toEqual({ type: 'Bearer', accessToken: 'newAccessToken', refreshToken: 'newRefreshToken' })
    })
  })
})
