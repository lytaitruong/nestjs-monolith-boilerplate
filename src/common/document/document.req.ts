import { applyDecorators, Type as TypeClass } from '@nestjs/common'
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsBoolean,
  IsDate,
  IsDefined,
  IsEnum,
  IsNumber,
  IsNumberOptions,
  IsNumberString,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator'

type ApiOptions = ApiPropertyOptions

export const IsSwaggerString = (options: ApiOptions = { required: true }) => {
  return applyDecorators(
    ApiProperty({ ...options, type: 'string' }),
    options.required ? IsDefined() : IsOptional(),
    IsString(options.isArray ? { each: true } : {}),
    ...(options.maxLength ? [MaxLength(options.maxLength)] : []),
    ...(options.minLength ? [MinLength(options.minLength)] : []),
    ...(options.required && options.isArray && options.maxItems ? [ArrayMaxSize(options.maxItems)] : []),
    ...(options.required && options.isArray && options.minItems ? [ArrayMinSize(options.minItems)] : []),
  )
}

export const IsSwaggerStringNumber = (options: ApiOptions = { required: true }) => {
  return applyDecorators(
    ApiProperty({ ...options, type: 'string' }),
    options.required ? IsDefined() : IsOptional(),
    IsNumberString({}, options.isArray ? { each: true } : {}),
    ...(options.maxLength ? [MaxLength(options.maxLength)] : []),
    ...(options.minLength ? [MinLength(options.minLength)] : []),
    ...(options.required && options.isArray && options.maxItems ? [ArrayMaxSize(options.maxItems)] : []),
    ...(options.required && options.isArray && options.minItems ? [ArrayMinSize(options.minItems)] : []),
  )
}

export const IsSwaggerNumber = (options: ApiOptions = { required: true }, config: IsNumberOptions = {}) => {
  return applyDecorators(
    ApiProperty({ ...options, type: 'number' }),
    options.required ? IsDefined() : IsOptional(),
    IsNumber(config, options.isArray ? { each: true } : {}),
    ...(options.minimum ? [Min(options.minimum)] : []),
    ...(options.maximum ? [Max(options.maximum)] : []),
    ...(options.required && options.isArray && options.maxItems ? [ArrayMaxSize(options.maxItems)] : []),
    ...(options.required && options.isArray && options.minItems ? [ArrayMinSize(options.minItems)] : []),
  )
}

export const IsSwaggerBoolean = (options: ApiOptions = { required: true }) => {
  return applyDecorators(
    ApiProperty({ ...options, type: 'boolean' }),
    options.required ? IsDefined() : IsOptional(),
    IsBoolean(options.isArray ? { each: true } : {}),
  )
}

export const IsSwaggerDate = (options: ApiOptions = { required: true }) => {
  return applyDecorators(
    ApiProperty({ ...options, type: 'date', default: new Date() }),
    options.required ? IsDefined() : IsOptional(),
    Transform(({ value }) => value && new Date(value)),
    IsDate(options.isArray ? { each: true } : {}),
  )
}

export const IsSwaggerEnum = <T extends object>(enumData: T, options: ApiOptions = { required: true }) => {
  return applyDecorators(
    ApiProperty({ ...options, type: 'enum', enum: enumData }),
    options.required ? IsDefined() : IsOptional(),
    IsEnum(enumData, options.isArray ? { each: true } : {}),
  )
}

export const IsSwaggerObject = <T>(typeClass: TypeClass<T>, options: ApiOptions = { required: true }) => {
  return applyDecorators(
    ApiProperty({ ...options, type: typeClass }),
    options.required ? IsDefined() : IsOptional(),
    ValidateNested(options.isArray ? { each: true } : {}),
    Type(() => typeClass),
    ...(options.required ? [ArrayNotEmpty()] : []),
    ...(options.required && options.minItems ? [ArrayMinSize(options.minItems)] : []),
    ...(options.required && options.maxItems ? [ArrayMaxSize(options.maxItems)] : []),
  )
}
