import { Type as TypeClass, applyDecorators } from '@nestjs/common'
import { ApiExtraModels, ApiOkResponse, ApiPropertyOptional, ApiPropertyOptions, getSchemaPath } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsOptional, Max, Min, ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator'
import { Sort } from './pagination.interface'
import { PaginatedResponseDto } from './pagination.response'

export const ApiPaginateLimit = (options: ApiPropertyOptions = {}, max = 10, min = 1) => {
  return applyDecorators(
    ApiPropertyOptional({ minimum: 1, maximum: max, ...options }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Max(max),
    Min(min),
  )
}

export const ApiPaginateRes = <ResDto extends TypeClass<unknown>>(resDTO: ResDto) => {
  const properties = { data: { type: 'array', items: { $ref: getSchemaPath(resDTO) } } }

  return applyDecorators(
    ApiExtraModels(PaginatedResponseDto, resDTO),
    ApiOkResponse({ schema: { $ref: getSchemaPath(PaginatedResponseDto), properties } }),
  )
}

export const IsLargeThan = <T>(property: keyof T, validationOptions?: ValidationOptions) => {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'isLargeThan',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: string | number | Date, args: ValidationArguments) {
          return value > (args.object as any)[args.constraints[0]]
        },

        defaultMessage(args: ValidationArguments) {
          const [constraintProperty]: (() => any)[] = args.constraints
          return `${args.property} must be large than ${constraintProperty}`
        },
      },
    })
  }
}

export const IsSorted = <T>(property: T[], validationOptions?: ValidationOptions) => {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'isSorted',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(object: { [data in keyof T]: Sort }, args: ValidationArguments) {
          for (const key in object) {
            const match = args.constraints[0].some((data: string) => data === key)
            if (!match) return false
          }
          return true
        },

        defaultMessage(args: ValidationArguments) {
          const [constraintProperty]: (() => T)[] = args.constraints
          return `${args.property} must be in this list enum ${constraintProperty}`
        },
      },
    })
  }
}
