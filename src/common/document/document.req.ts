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
  IsNumberString,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator'

export function IsSwaggerString(options: ApiPropertyOptions = {}) {
  return applyDecorators(
    ApiProperty({
      type: 'string',
      description: options.required ? 'required' : 'not required',
      ...options,
    }),
    options.required ? IsDefined() : IsOptional(),
    IsString(),
    ...(options.maxLength ? [MaxLength(options.maxLength)] : []),
    ...(options.minLength ? [MinLength(options.minLength)] : []),
  )
}

export function IsSwaggerArrayString(options: ApiPropertyOptions = {}) {
  return applyDecorators(
    ApiProperty({
      isArray: true,
      type: 'string',
      description: options.required ? 'required' : 'not required',
      ...options,
    }),
    options.required ? IsDefined() : IsOptional(),
    IsString({ each: true }),
    ...(options.maxLength ? [MaxLength(options.maxLength)] : []),
    ...(options.minLength ? [MinLength(options.minLength)] : []),
    ...(options.maxItems ? [ArrayMaxSize(options.maxItems)] : []),
    ...(options.minItems ? [ArrayMinSize(options.minItems)] : []),
  )
}

export function IsSwaggerStringNumber(options: ApiPropertyOptions = {}) {
  return applyDecorators(
    ApiProperty({
      type: 'string',
      description: options.required ? 'required' : 'not required',
      ...options,
    }),
    options.required ? IsDefined() : IsOptional(),
    IsNumberString(),
    ...(options.maxLength ? [MaxLength(options.maxLength)] : []),
    ...(options.minLength ? [MinLength(options.minLength)] : []),
  )
}

export function IsSwaggerArrayStringNumber(options: ApiPropertyOptions = {}) {
  return applyDecorators(
    ApiProperty({
      type: 'string',
      description: options.required ? 'required' : 'not required',
      ...options,
    }),
    options.required ? IsDefined() : IsOptional(),
    IsNumberString({}, { each: true }),
    ...(options.maxLength ? [MaxLength(options.maxLength)] : []),
    ...(options.minLength ? [MinLength(options.minLength)] : []),
    ...(options.maxItems ? [ArrayMaxSize(options.maxItems)] : []),
    ...(options.minItems ? [ArrayMinSize(options.minItems)] : []),
  )
}

export function IsSwaggerNumber(options: ApiPropertyOptions = {}) {
  return applyDecorators(
    ApiProperty({
      type: 'number',
      description: options.required ? 'required' : 'not required',
      ...options,
    }),
    options.required ? IsDefined() : IsOptional(),
    IsNumber(),
    ...(options.minimum ? [Min(options.minimum)] : []),
    ...(options.maximum ? [Max(options.maximum)] : []),
  )
}

export function IsSwaggerArrayNumber(options: ApiPropertyOptions = {}) {
  return applyDecorators(
    ApiProperty({
      type: 'number',
      description: options.required ? 'required' : 'not required',
      ...options,
    }),
    options.required ? IsDefined() : IsOptional(),
    IsNumber({}, { each: true }),
    ...(options.minimum ? [Min(options.minimum)] : []),
    ...(options.maximum ? [Max(options.maximum)] : []),
    ...(options.maxItems ? [ArrayMaxSize(options.maxItems)] : []),
    ...(options.minItems ? [ArrayMinSize(options.minItems)] : []),
  )
}

export function IsSwaggerBoolean(options: ApiPropertyOptions = {}) {
  return applyDecorators(
    ApiProperty({
      type: 'boolean',
      description: options.required ? 'required' : 'not required',
      ...options,
    }),
    options.required ? IsDefined() : IsOptional(),
    IsBoolean(),
  )
}

export function IsSwaggerArrayBoolean(options: ApiPropertyOptions = {}) {
  return applyDecorators(
    ApiProperty({
      type: 'boolean',
      description: options.required ? 'required' : 'not required',
      ...options,
    }),
    options.required ? IsDefined() : IsOptional(),
    IsBoolean({ each: true }),
  )
}

export function IsSwaggerDate(options: ApiPropertyOptions = {}) {
  return applyDecorators(
    ApiProperty({
      type: 'date',
      default: new Date(),
      description: options.required ? 'required' : 'not required',
      ...options,
    }),
    options.required ? IsDefined() : IsOptional(),
    Transform(({ value }: { value: string }) => value && new Date(value)),
    IsDate(),
  )
}

export function IsSwaggerArrayDate(options: ApiPropertyOptions = {}) {
  return applyDecorators(
    ApiProperty({
      type: 'date',
      default: new Date(),
      description: options.required ? 'required' : 'not required',
      ...options,
    }),
    options.required ? IsDefined() : IsOptional(),
    Transform(({ value }) => value && new Date(value)),
    IsDate({ each: true }),
  )
}

export function IsSwaggerEnum(enumData: Record<string, string | number | boolean>, options: ApiPropertyOptions = {}) {
  return applyDecorators(
    ApiProperty({
      type: 'enum',
      enum: enumData,
      description: options.required ? 'required' : 'not required',
      ...options,
    }),
    options.required ? IsDefined() : IsOptional(),
    IsEnum(enumData),
  )
}

export function IsSwaggerArrayEnum(
  enumData: Record<string, string | number | boolean>,
  options: ApiPropertyOptions = {},
) {
  return applyDecorators(
    ApiProperty({
      type: 'enum',
      enum: enumData,
      description: options.required ? 'required' : 'not required',
      ...options,
    }),
    options.required ? IsDefined() : IsOptional(),
    IsEnum(enumData, { each: true }),
  )
}

export function IsSwaggerObject<T>(typeClass: TypeClass<T>, options: ApiPropertyOptions = {}) {
  return applyDecorators(
    ApiProperty({
      type: typeClass,
      ...options,
    }),
    options.required ? IsDefined() : IsOptional(),
    ValidateNested(),
    Type(() => typeClass),
  )
}

export function IsSwaggerArray<T>(typeClass: TypeClass<T>, options: ApiPropertyOptions = {}) {
  return applyDecorators(
    ApiProperty({
      isArray: true,
      type: typeClass,
      description: options.required ? 'required' : 'not required',
      ...options,
    }),
    ValidateNested({ each: true }),
    Type(() => typeClass),
    ...(options.required ? [ArrayNotEmpty()] : []),
    ...(options.required && options.minItems ? [ArrayMinSize(options.minItems)] : []),
    ...(options.required && options.maxItems ? [ArrayMaxSize(options.maxItems)] : []),
  )
}
