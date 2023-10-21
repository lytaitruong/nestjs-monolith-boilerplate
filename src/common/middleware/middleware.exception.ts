import { I18nTranslations } from '@/generated/i18n.generated'
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { isArray } from 'lodash'
import { I18nContext } from 'nestjs-i18n'
import { AppException, IError } from '../common.error'
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

    //! i18n translation error message
    const i18n = I18nContext.current<I18nTranslations>(host)
    if (exception instanceof AppException && i18n.lang !== 'en') {
      const message = i18n.t(`error.${error.code as keyof I18nTranslations['error']}`)
      if (message) error.message = message
    }

    this.logger.error({ error }, exception.stack)
    return res.code(exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR).send(error)
  }

  private formatError(message: string | string[], code: string): IError {
    return {
      type: 'REST',
      code,
      time: new Date().toISOString(),
      message: isArray(message) ? message[0] : message,
    }
  }
}
