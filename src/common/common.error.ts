import { HttpException, HttpStatus } from '@nestjs/common'
import { ISO_DATE } from './common.enum'

export enum ErrorType {
  REST = 'REST',
  GRPC = 'GRPC',
  GRAPHQL = 'GRAPHQL',
}

export interface IError {
  type: ErrorType
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
      type: ErrorType.REST,
      code: this.error.code,
      time: new Date().toISOString(),
      message: this.error.message,
    }
  }
}
