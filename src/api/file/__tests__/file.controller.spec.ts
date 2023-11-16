import { IReq } from '@/common'
import { JwtInfo } from '@/modules/guard'
import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { FileController } from '../file.controller'
import { FileCreateDto } from '../file.dto'
import { FileService } from '../file.service'
describe(`FileController`, () => {
  let controller: FileController
  let service: FileService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
    })
      .useMocker(createMock)
      .compile()

    controller = module.get<FileController>(FileController)
    service = module.get<FileService>(FileService)
  })

  describe(`POST create`, () => {
    it(`should return id of file to tracking file data processing`, async () => {
      const user = { sub: '1', role: 'user', device: 'iphone15', iat: Date.now(), exp: Date.now() }
      const data: FileCreateDto = {
        file: {
          encoding: 'utf-8',
          fieldname: 'file',
          file: jest.fn().mockReturnValue(Buffer.from('stream-data')) as any,
          filename: 'file',
          mimetype: 'text/csv',
          toBuffer: jest.fn().mockReturnValue(Buffer.from('stream-data')),
          fields: {},
          type: 'file',
        },
      }
      const req = createMock<IReq<JwtInfo>>({ user })

      jest.spyOn(service, 'create').mockResolvedValue({ id: '1' })

      expect(await controller.create(req, data)).toEqual({ id: '1' })
      expect(service.create).toHaveBeenCalledTimes(1)
      expect(service.create).toHaveBeenCalledWith(user, data)
    })
  })
})
