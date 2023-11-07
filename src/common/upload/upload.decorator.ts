import type { MultipartFile } from '@fastify/multipart'
import { UseInterceptors, applyDecorators } from '@nestjs/common'
import { ApiConsumes, ApiProperty, ApiPropertyOptions } from '@nestjs/swagger'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsDefined,
  IsOptional,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator'
import { isArray } from 'lodash'
import { UploadInterceptor } from './upload.interceptor'

type ApiOptions = ApiPropertyOptions

export const UploadFormData = () => {
  return applyDecorators(UseInterceptors(UploadInterceptor), ApiConsumes('multipart/form-data'))
}

export const IsSwaggerFile = (options: ApiOptions = { required: true }, mimeType?: string[]) => {
  return applyDecorators(
    ApiProperty({ ...options, type: 'string', format: 'binary' }),
    options.required ? IsDefined() : IsOptional(),
    ...(mimeType ? [IsContainMimeType(mimeType)] : []),
    ...(options.required && options.minItems ? [ArrayMinSize(options.minItems)] : []),
    ...(options.required && options.maxItems ? [ArrayMaxSize(options.maxItems)] : []),
  )
}

export const IsContainMimeType = (property: string[], validationOptions?: ValidationOptions) => {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsContainMimeType',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: MultipartFile | MultipartFile[], args: ValidationArguments) {
          if (!value) return false
          return isArray(value)
            ? value.every((item) => args.constraints[0].includes(item.mimetype))
            : args.constraints[0].includes(value.mimetype)
        },
        defaultMessage(args: ValidationArguments) {
          const [constraintProperty]: (() => string)[] = args.constraints
          return `${args.property} must be in this list enum ${constraintProperty}`
        },
      },
    })
  }
}
