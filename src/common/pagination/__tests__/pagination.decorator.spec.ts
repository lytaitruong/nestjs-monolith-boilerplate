import { ApiPaginateLimit } from '@/common'
import { plainToInstance } from 'class-transformer'
import { ValidationError, validate } from 'class-validator'
describe(`PaginationDecorator`, () => {
  beforeEach(() => {
    jest.resetModules()
  })
  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  describe(`ApiPaginationLimit`, () => {
    class DTO {
      @ApiPaginateLimit()
      limit: number
    }
    it.each<any>([undefined, null, 1, 10, true])(`should passed if limit is equal to %s`, async (value) => {
      const dto = new DTO()
      dto.limit = value
      const instance = plainToInstance(DTO, dto)

      const errors = await validate(instance, { whitelist: true })
      expect(errors).toEqual([])
    })
    it.each<any>([-1, 0, 11, '-1', '0', '11', 5.5, -5.5, false, {}, NaN, ''])(
      `should throw error if limit is equal to %s`,
      async (value) => {
        const dto = new DTO()
        dto.limit = value
        const instance = plainToInstance(DTO, dto)

        const errors = await validate(instance, { whitelist: true })
        expect(errors).not.toEqual([])
        expect(errors[0]).toBeInstanceOf(ValidationError)
        expect(errors[0].property).toEqual('limit')
      },
    )
  })
})
