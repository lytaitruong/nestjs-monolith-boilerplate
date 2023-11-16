import { createMock } from '@golevelup/ts-jest'
import { ArgumentsHost, ExecutionContext } from '@nestjs/common'

export const getContextMock = <T, E>(req: T, res: E) => {
  const executeContext = createMock<ExecutionContext>()
  executeContext.switchToHttp.mockImplementationOnce(() => {
    return {
      getNext: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockImplementation(() => req),
      getResponse: jest.fn().mockImplementationOnce(() => res),
    }
  })
  return executeContext
}

export const getArgumentMock = <T, E>(req: T, res: E) => {
  const hostArgument = createMock<ArgumentsHost>()
  hostArgument.switchToHttp.mockImplementationOnce(() => {
    return {
      getNext: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockImplementation(() => req),
      getResponse: jest.fn().mockImplementationOnce(() => res),
    }
  })
  return hostArgument
}
