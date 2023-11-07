import type { IRes } from '@/common'
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

@Catch(PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  private readonly statusMapping = new Map<string, HttpStatus>([
    ['P2000', HttpStatus.BAD_REQUEST],
    ['P2002', HttpStatus.CONFLICT],
    ['P2025', HttpStatus.NOT_FOUND],
  ])

  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse<IRes>()

    const message = exception.message.substring(exception.message.indexOf('→'))
    const error = {
      type: 'REST',
      code: exception.code,
      message: message.substring(message.indexOf('\n')).replace(/\n/g, '').trim(),
      time: new Date().toISOString(),
    }
    return res.code(this.statusMapping.get(exception.code) || HttpStatus.INTERNAL_SERVER_ERROR).send(error)
  }
}
