import { createMock } from '@golevelup/ts-jest'
import { ArgumentsHost, HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { PrismaClientExceptionFilter } from '../prisma.exception'
import { PrismaModule } from '../prisma.module'

describe(`PrismaException`, () => {
  let filter: PrismaClientExceptionFilter

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [PrismaClientExceptionFilter],
    })
      .useMocker(createMock)
      .compile()

    filter = module.get(PrismaClientExceptionFilter)
  })
  beforeEach(() => {
    jest.resetModules()
  })
  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(filter).toBeDefined()
  })

  it.each<[HttpStatus, string, string]>([
    [
      HttpStatus.BAD_REQUEST,
      `P2000`,
      `The provided value for the column is too long for the column's type. Column: username`,
    ],
    [HttpStatus.CONFLICT, `P2002`, `Unique constraint failed on the phone`],
    [
      HttpStatus.NOT_FOUND,
      `P2025`,
      `An operation failed because it depends on one or more records that were required but not found. Username not exist`,
    ],
    [
      HttpStatus.INTERNAL_SERVER_ERROR,
      `P2003`,
      `The record searched for in the where condition (users.phone = '0123456789') does not exist`,
    ],
  ])(`Catch %s if Prisma Error code is %s`, async (status, errorCode, message) => {
    const error = new PrismaClientKnownRequestError(message, { clientVersion: '5.x', code: errorCode })
    const hostArgument = createMock<ArgumentsHost>()
    const code = jest.fn().mockReturnThis()
    const send = jest.fn().mockReturnThis()
    hostArgument.switchToHttp.mockImplementationOnce(() => {
      return {
        getNext: jest.fn().mockReturnThis(),
        getRequest: jest.fn().mockReturnThis(),
        getResponse: jest.fn().mockImplementationOnce(() => {
          return {
            code,
            send,
          }
        }),
      }
    })
    await filter.catch(error, hostArgument)
    expect(code).toHaveBeenCalled()
    expect(code).toHaveBeenCalledTimes(1)
    expect(code).toHaveBeenCalledWith(status)

    expect(send).toHaveBeenCalled()
    expect(send).toHaveBeenCalledTimes(1)
    expect(send).toHaveBeenCalledWith({
      type: 'REST',
      code: error.code,
      message,
      time: expect.any(String),
    })
  })
})
