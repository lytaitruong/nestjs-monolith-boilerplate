import { HttpStatus, Type, applyDecorators } from '@nestjs/common'
import { ApiProperty, ApiResponse } from '@nestjs/swagger'
import { ErrorType, IAppError, IError } from '../common.error'

export const ApiPassedRes = <DataDto extends Type<unknown>>(dataDto: DataDto, status: HttpStatus = 200) => {
  return ApiResponse({ type: dataDto, status })
}

export const ApiSchemaRes = (schema: IAppError): Type<IError> => {
  class SchemaResponse implements IError {
    @ApiProperty({ name: 'type', type: 'enum', enum: ErrorType, default: ErrorType.REST })
    type: ErrorType

    @ApiProperty({ name: 'time', type: 'string', default: new Date().toISOString() })
    time: string

    @ApiProperty({ name: 'code', type: 'string', default: schema.code })
    code: string

    @ApiProperty({ name: 'message', type: 'string', default: schema.message })
    message: string
  }
  Object.defineProperty(SchemaResponse, 'name', { writable: true, value: schema.code })
  return SchemaResponse
}

export const ApiFailedRes = (...schemas: IAppError[]) => {
  return applyDecorators(
    ApiResponse({
      status: schemas[0].status,
      content: {
        'application/json': {
          examples: schemas.reduce((list, schema) => {
            list[schema.code] = { value: schema }
            return list
          }, {}),
        },
      },
    }),
  )
}
