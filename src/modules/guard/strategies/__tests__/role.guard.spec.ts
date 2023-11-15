import { getContextMock } from '@/__mocks__/context.mock'
import { AppException } from '@/common'
import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { GUARD_ERROR } from '../../guard.exception'
import { GuardType } from '../../guard.interface'
import { RoleGuard, Roles } from '../role.guard'

describe(`RoleGuard`, () => {
  let guard: RoleGuard

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleGuard],
    })
      .useMocker(createMock)
      .compile()

    guard = module.get(RoleGuard)
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
  })

  describe(`Roles`, () => {
    it(`Should add role metadata to reflect`, async () => {
      @Roles('admin', 'user')
      class A {}

      @Roles('admin')
      class B {}

      expect(Reflect.getMetadata(GuardType.ROLE, A)).toEqual(['admin', 'user'])
      expect(Reflect.getMetadata(GuardType.ROLE, B)).toEqual(['admin'])
      expect(Reflect.getMetadata(GuardType.ROLE, B)).not.toEqual(['admin', 'user'])
    })
  })
  describe(`canActivate`, () => {
    it(`should return true if context not define decorator Role`, async () => {
      jest.spyOn(guard['reflector'], 'getAllAndOverride').mockReturnValue(null)

      const code = jest.fn().mockReturnThis()
      const send = jest.fn().mockReturnThis()
      const context = getContextMock({}, { code, send })

      const response = await guard.canActivate(context)
      expect(response).toEqual(true)
      expect(guard['reflector'].getAllAndOverride).toHaveBeenCalledTimes(1)
      expect(guard['reflector'].getAllAndOverride).toHaveBeenCalledWith(GuardType.ROLE, [
        context.getHandler(),
        context.getClass(),
      ])
    })

    it(`should return true if context has decorator Role match with jwt payload role`, async () => {
      jest.spyOn(guard['reflector'], 'getAllAndOverride').mockReturnValue(['user', 'admin'])

      const code = jest.fn().mockReturnThis()
      const send = jest.fn().mockReturnThis()
      const context = getContextMock({ user: { role: 'user' } }, { code, send })

      const response = await guard.canActivate(context)
      expect(response).toEqual(true)
      expect(guard['reflector'].getAllAndOverride).toHaveBeenCalledTimes(1)
      expect(guard['reflector'].getAllAndOverride).toHaveBeenCalledWith(GuardType.ROLE, [
        context.getHandler(),
        context.getClass(),
      ])
    })

    it(`should throw FORBIDDEN_RESOURCE with code 403 when role not match with jwt payload role`, async () => {
      jest.spyOn(guard['reflector'], 'getAllAndOverride').mockReturnValue(['admin'])

      const code = jest.fn().mockReturnThis()
      const send = jest.fn().mockReturnThis()
      const context = getContextMock({ user: { role: 'user' } }, { code, send })

      expect.assertions(4)
      try {
        await guard.canActivate(context)
      } catch (error) {
        expect(error.error).toEqual(GUARD_ERROR.FORBIDDEN_RESOURCE)
        expect(error).toBeInstanceOf(AppException)
        expect(guard['reflector'].getAllAndOverride).toHaveBeenCalledTimes(1)
        expect(guard['reflector'].getAllAndOverride).toHaveBeenCalledWith(GuardType.ROLE, [
          context.getHandler(),
          context.getClass(),
        ])
      }
    })
  })
})
