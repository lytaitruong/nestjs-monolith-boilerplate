import { getContextMock } from '@/__mocks__/context.mock'
import { createMock } from '@golevelup/ts-jest'
import { CallHandler } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { of } from 'rxjs'
import { HttpInterceptor } from '../middleware.interceptor'

describe(`HttpInterceptor`, () => {
  let interceptor: HttpInterceptor<{ message: string }>

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpInterceptor],
    })
      .useMocker(createMock)
      .compile()
    interceptor = module.get(HttpInterceptor)
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

  it(`should throw error`, async () => {
    const next = {
      handle: jest.fn().mockImplementation(() => {
        throw new Error('error')
      }),
    } as CallHandler
    const context = getContextMock({}, {})

    expect.assertions(1)
    try {
      await interceptor.intercept(context, next)
    } catch (error) {
      expect(error).toEqual(new Error('error'))
    }
  })

  it.each<[string, any, any]>([
    ['Healthcheck Ping!', 'Ping!', 'Ping!'],
    ['Object res!', { data: 'data' }, { data: 'data' }],
    [
      'Object paginate res!',
      { data: [], meta: { currentPage: 1, lastPage: 1, perPage: 1, next: null, prev: null, total: 1 } },
      { data: [], meta: { page: 1, last: 1, size: 1, next: null, prev: null, total: 1 } },
    ],
  ])(`Should return success if %s`, async (message, input, output) => {
    const next = {
      handle: jest.fn(() => of(input)),
    } as CallHandler

    const context = getContextMock({}, {})

    const response = await interceptor.intercept(context, next)

    expect.assertions(1)
    response.subscribe({
      next: (data) => {
        expect(data).toEqual(output)
      },
    })
  })
})
