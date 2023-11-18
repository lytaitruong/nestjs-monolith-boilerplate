import { getArgumentMock } from '@/__mocks__/context.mock'
import { createMock } from '@golevelup/ts-jest'
import { HttpException, HttpStatus, Logger } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { isArray } from 'lodash'
import { I18nContext } from 'nestjs-i18n'
import { HttpExceptionFilter } from '../middleware.exception'

describe(`HttpExceptionFilter`, () => {
  let filter: HttpExceptionFilter
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpExceptionFilter],
    })
      .setLogger(createMock<Logger>())
      .useMocker(createMock)
      .compile()
    filter = module.get(HttpExceptionFilter)
  })
  beforeEach(() => {
    jest.resetModules()
  })
  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })
  it(`should be defined`, async () => {
    expect(filter).toBeDefined()
  })

  it.each<string | string[]>(['Http Exception', ['internal server error', 'something wrong']])(
    `should throw HttpException`,
    async (message) => {
      const code = jest.fn().mockReturnThis()
      const send = jest.fn().mockReturnThis()
      const hostArgument = getArgumentMock({}, { code, send })
      const translate = jest.fn().mockReturnThis()

      I18nContext.current = jest.fn().mockImplementation(() => ({
        t: translate,
      }))

      const error = new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR)
      filter.catch(error, hostArgument)

      expect(translate).not.toHaveBeenCalled()
      expect(I18nContext.current).toHaveBeenCalledTimes(1)
      expect(I18nContext.current).toHaveBeenCalledWith(hostArgument)
      expect(code).toHaveBeenCalledTimes(1)
      expect(code).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR)
      expect(send).toHaveBeenCalledTimes(1)
      expect(send).toHaveBeenCalledWith({
        type: 'REST',
        code: 'Http Exception',
        time: expect.any(String),
        message: isArray(message) ? message[0] : message,
      })
    },
  )

  // it.each<[string, string, string | null]>([
  //   [`message in i18n`, `Enjoy food`, `Bon Appetit`],
  //   [`message not in i18n`, `Enjoy food`, null],
  // ])(`should throw AppException and response %s`, async (content, message, i18nMessage) => {
  //   const code = jest.fn().mockReturnThis()
  //   const send = jest.fn().mockReturnThis()
  //   const hostArgument = getArgumentMock({}, { code, send })
  //   const translate = jest.fn().mockReturnValue(i18nMessage)

  //   I18nContext.current = jest.fn().mockImplementation(() => ({
  //     t: translate,
  //   }))

  //   const error = new AppException({ code: '0000', message, status: HttpStatus.BAD_REQUEST })
  //   filter.catch(error, hostArgument)

  //   expect(translate).toHaveBeenCalled()
  //   expect(translate).toHaveBeenCalledWith('error.0000')
  //   expect(I18nContext.current).toHaveBeenCalledTimes(1)
  //   expect(I18nContext.current).toHaveBeenCalledWith(hostArgument)
  //   expect(code).toHaveBeenCalledTimes(1)
  //   expect(code).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST)
  //   expect(send).toHaveBeenCalledTimes(1)
  //   expect(send).toHaveBeenCalledWith({
  //     type: 'REST',
  //     code: '0000',
  //     time: expect.any(String),
  //     message: i18nMessage ?? message,
  //   })
  // })
})
