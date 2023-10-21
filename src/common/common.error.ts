import { HttpException, HttpStatus, Inject } from '@nestjs/common'
import { PinoLogger } from 'nestjs-pino'
import { ISO_DATE } from './common.interface'

export interface IError {
  type: 'REST' | 'GRPC' | 'GRAPHQL'
  time: ISO_DATE
  code: string
  message: string
}

export interface IAppError {
  code: string
  status: HttpStatus
  message: string
}

export class AppException extends HttpException {
  constructor(private readonly error: IAppError) {
    super(error, error.status)
  }

  override getResponse(): IError {
    return {
      type: 'REST',
      code: this.error.code,
      time: new Date().toISOString(),
      message: this.error.message,
    }
  }
}

export const CatchErr = (error: IAppError) => {
  const injectLogger = Inject(PinoLogger)

  return (target: any, propertyKey: string, propertyDescriptor: PropertyDescriptor) => {
    injectLogger(target, 'logger')
    const originalMethod = propertyDescriptor.value

    propertyDescriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args)
      } catch (err) {
        const logger = this.logger
        logger.setContext(target.constructor.name)
        logger.error(err.message, err.stack)

        throw new AppException(error)
      }
    }
  }
}
