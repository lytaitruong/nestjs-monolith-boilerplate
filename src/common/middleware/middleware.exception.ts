import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { isArray } from 'lodash'
import { AppException, ErrorType, IError } from '../common.error'
import { IRes } from '../common.interface'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: AppException | HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse<IRes>()

    const error: IError =
      exception instanceof AppException
        ? exception.getResponse()
        : this.formatError(exception['response']['message'], exception.message)
    this.logger.error({ error }, exception.stack)
    return res.code(exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR).send(error)
  }

  private formatError(message: string | string[], code: string): IError {
    return {
      type: ErrorType.REST,
      code,
      time: new Date().toISOString(),
      message: isArray(message) ? message[0] : message,
    }
  }
}
