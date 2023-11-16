import { IReq } from '@/common'
import { JwtInfo } from '@/modules/guard'
import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { UserController } from '../user.controller'
import { UserUpdateDto } from '../user.dto'
import { UserService } from '../user.service'

describe(`UserController`, () => {
  let controller: UserController
  let service: UserService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
    })
      .useMocker(createMock)
      .compile()

    controller = module.get<UserController>(UserController)
    service = module.get<UserService>(UserService)
  })

  describe(`GET getOne`, () => {
    it(`should return user info`, async () => {
      const user = { sub: '1', role: 'user', device: 'iphone15', iat: Date.now(), exp: Date.now() }

      const req = createMock<IReq<JwtInfo>>({ user })

      jest.spyOn(service, 'getOne').mockResolvedValue({ id: '1', role: 'USER' })

      expect(await controller.getOne(req)).toEqual({ id: '1', role: 'USER' })
      expect(service.getOne).toHaveBeenCalledTimes(1)
      expect(service.getOne).toHaveBeenCalledWith(user)
    })
  })

  describe(`PATCH updateProfile`, () => {
    it(`should return user info after update`, async () => {
      const user = { sub: '1', role: 'user', device: 'iphone15', iat: Date.now(), exp: Date.now() }
      const data: UserUpdateDto = { phone: '0382839201' }
      const createdAt = new Date()
      const req = createMock<IReq<JwtInfo>>({ user })

      jest.spyOn(service, 'update').mockResolvedValue({
        id: '1',
        phone: data.phone,
        email: 'email@gmail.com',
        gender: 'MALE',
        image: 'image.png',
        state: 'ONLINE',
        createdAt,
      })

      expect(await controller.updateProfile(req, data)).toEqual({
        id: '1',
        phone: data.phone,
        email: 'email@gmail.com',
        gender: 'MALE',
        image: 'image.png',
        state: 'ONLINE',
        createdAt,
      })
      expect(service.update).toHaveBeenCalledTimes(1)
      expect(service.update).toHaveBeenCalledWith(user, data)
    })
  })
})
