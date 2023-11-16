import { getContextMock } from '@/__mocks__/context.mock'
import { createMock } from '@golevelup/ts-jest'
import { BadRequestException, CallHandler, HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { of } from 'rxjs'
import { UploadInterceptor } from '../upload.interceptor'

describe(`UploadInterceptor`, () => {
  let interceptor: UploadInterceptor<any>

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadInterceptor],
    })
      .useMocker(createMock)
      .compile()
    interceptor = module.get(UploadInterceptor)
  })
  beforeEach(() => {
    jest.resetModules()
  })
  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  it(`should be defined`, () => {
    expect(interceptor).toBeDefined()
  })

  it(`should throw BadRequestException if not multipart`, async () => {
    const next = {
      handle: jest.fn().mockImplementation(() => {
        throw new Error('error')
      }),
    } as CallHandler
    const context = getContextMock(
      {
        isMultipart: jest.fn().mockImplementation(() => false),
      },
      {},
    )

    expect.assertions(2)
    try {
      await interceptor.intercept(context, next)
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException)
      expect(error.getResponse()).toEqual({
        code: `0000`,
        message: `content-type must be multipart/form-data`,
        status: HttpStatus.BAD_REQUEST,
      })
    }
  })

  it(`should return body info formatted`, async () => {
    const body = {
      file: {
        encoding: 'utf-8',
        fieldname: 'file',
        file: jest.fn().mockReturnValue(Buffer.from('stream-data')) as any,
        filename: 'file',
        mimetype: 'text/csv',
        toBuffer: jest.fn().mockReturnValue(Buffer.from('stream-data')),
        fields: [{ filename: 'file.png' }],
        type: 'file',
      },
      files: [
        {
          encoding: 'utf-8',
          fieldname: 'file',
          file: jest.fn().mockReturnValue(Buffer.from('stream-data')) as any,
          filename: 'file',
          mimetype: 'text/csv',
          toBuffer: jest.fn().mockReturnValue(Buffer.from('stream-data')),
          fields: [{ filename: 'file.png' }],
          type: 'file',
        },
      ],
    }
    const code = jest.fn().mockReturnThis()
    const send = jest.fn().mockReturnThis()
    const next = {
      handle: jest.fn(() => of(body)),
    } as CallHandler
    const context = getContextMock(
      {
        isMultipart: jest.fn().mockImplementation(() => true),
        body,
      },
      { code, send },
    )

    const response = await interceptor.intercept(context, next)
    expect.assertions(1)
    response.subscribe({
      next: (data) => {
        const output = Object.assign({}, body)
        delete output.file.fields
        output.files = output.files.map((file) => {
          delete file.fields
          return file
        })
        expect(data).toEqual(output)
      },
    })
  })
})
