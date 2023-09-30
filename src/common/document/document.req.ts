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

export function IsSwaggerString(options: ApiPropertyOptions = {}, required = true) {
  return applyDecorators(
    ApiProperty({
      type: 'string',
      required,
      description: required ? 'required' : 'not required',
      ...options,
    }),
    required ? IsDefined() : IsOptional(),
    IsString(),
    ...(options.maxLength ? [MaxLength(options.maxLength)] : []),
    ...(options.minLength ? [MinLength(options.minLength)] : []),
  )
}

export function IsSwaggerArrayString(options: ApiPropertyOptions = {}, required = true) {
  return applyDecorators(
    ApiProperty({
      isArray: true,
      type: 'string',
      required,
      description: required ? 'required' : 'not required',
      ...options,
    }),
    required ? IsDefined() : IsOptional(),
    IsString({ each: true }),
    ...(options.maxLength ? [MaxLength(options.maxLength)] : []),
    ...(options.minLength ? [MinLength(options.minLength)] : []),
    ...(options.maxItems ? [ArrayMaxSize(options.maxItems)] : []),
    ...(options.minItems ? [ArrayMinSize(options.minItems)] : []),
  )
}

export function IsSwaggerStringNumber(options: ApiPropertyOptions = {}, required = true) {
  return applyDecorators(
    ApiProperty({
      type: 'string',
      required,
      description: required ? 'required' : 'not required',
      ...options,
    }),
    required ? IsDefined() : IsOptional(),
    IsNumberString(),
    ...(options.maxLength ? [MaxLength(options.maxLength)] : []),
    ...(options.minLength ? [MinLength(options.minLength)] : []),
  )
}

export function IsSwaggerArrayStringNumber(options: ApiPropertyOptions = {}, required = true) {
  return applyDecorators(
    ApiProperty({
      type: 'string',
      required,
      description: required ? 'required' : 'not required',
      ...options,
    }),
    required ? IsDefined() : IsOptional(),
    IsNumberString({}, { each: true }),
    ...(options.maxLength ? [MaxLength(options.maxLength)] : []),
    ...(options.minLength ? [MinLength(options.minLength)] : []),
    ...(options.maxItems ? [ArrayMaxSize(options.maxItems)] : []),
    ...(options.minItems ? [ArrayMinSize(options.minItems)] : []),
  )
}

export function IsSwaggerNumber(options: ApiPropertyOptions = {}, required = true) {
  return applyDecorators(
    ApiProperty({
      type: 'number',
      required,
      description: required ? 'required' : 'not required',
      ...options,
    }),
    required ? IsDefined() : IsOptional(),
    IsNumber(),
    ...(options.minimum ? [Min(options.minimum)] : []),
    ...(options.maximum ? [Max(options.maximum)] : []),
  )
}

export function IsSwaggerArrayNumber(options: ApiPropertyOptions = {}, required = true) {
  return applyDecorators(
    ApiProperty({
      type: 'number',
      required,
      description: required ? 'required' : 'not required',
      ...options,
    }),
    required ? IsDefined() : IsOptional(),
    IsNumber({}, { each: true }),
    ...(options.minimum ? [Min(options.minimum)] : []),
    ...(options.maximum ? [Max(options.maximum)] : []),
    ...(options.maxItems ? [ArrayMaxSize(options.maxItems)] : []),
    ...(options.minItems ? [ArrayMinSize(options.minItems)] : []),
  )
}

export function IsSwaggerBoolean(options: ApiPropertyOptions = {}, required = true) {
  return applyDecorators(
    ApiProperty({
      type: 'boolean',
      required,
      description: required ? 'required' : 'not required',
      ...options,
    }),
    required ? IsDefined() : IsOptional(),
    IsBoolean(),
  )
}

export function IsSwaggerArrayBoolean(options: ApiPropertyOptions = {}, required = true) {
  return applyDecorators(
    ApiProperty({
      type: 'boolean',
      required,
      description: required ? 'required' : 'not required',
      ...options,
    }),
    required ? IsDefined() : IsOptional(),
    IsBoolean({ each: true }),
  )
}

export function IsSwaggerDate(options: ApiPropertyOptions = {}, required = true) {
  return applyDecorators(
    ApiProperty({
      type: 'date',
      default: new Date(),
      required,
      description: required ? 'required' : 'not required',
      ...options,
    }),
    required ? IsDefined() : IsOptional(),
    Transform(({ value }: { value: string }) => value && new Date(value)),
    IsDate(),
  )
}

export function IsSwaggerArrayDate(options: ApiPropertyOptions = {}, required = true) {
  return applyDecorators(
    ApiProperty({
      type: 'date',
      default: new Date(),
      required,
      description: required ? 'required' : 'not required',
      ...options,
    }),
    required ? IsDefined() : IsOptional(),
    Transform(({ value }) => value && new Date(value)),
    IsDate({ each: true }),
  )
}

export function IsSwaggerEnum(
  enumData: Record<string, string | number | boolean>,
  options: ApiPropertyOptions = {},
  required = true,
) {
  return applyDecorators(
    ApiProperty({
      type: 'enum',
      enum: enumData,
      required,
      description: required ? 'required' : 'not required',
      ...options,
    }),
    required ? IsDefined() : IsOptional(),
    IsEnum(enumData),
  )
}

export function IsSwaggerArrayEnum(
  enumData: Record<string, string | number | boolean>,
  options: ApiPropertyOptions = {},
  required = true,
) {
  return applyDecorators(
    ApiProperty({
      type: 'enum',
      enum: enumData,
      required,
      description: required ? 'required' : 'not required',
      ...options,
    }),
    required ? IsDefined() : IsOptional(),
    IsEnum(enumData, { each: true }),
  )
}

export function IsSwaggerObject<T>(typeClass: TypeClass<T>, options: ApiPropertyOptions = {}, required = true) {
  return applyDecorators(
    ApiProperty({
      type: typeClass,
      required,
      ...options,
    }),
    required ? IsDefined() : IsOptional(),
    ValidateNested(),
    Type(() => typeClass),
  )
}

export function IsSwaggerArray<T>(typeClass: TypeClass<T>, options: ApiPropertyOptions = {}, required = true) {
  return applyDecorators(
    ApiProperty({
      isArray: true,
      type: typeClass,
      required,
      description: required ? 'required' : 'not required',
      ...options,
    }),
    ValidateNested({ each: true }),
    Type(() => typeClass),
    ...(required ? [ArrayNotEmpty()] : []),
    ...(required && options.minItems ? [ArrayMinSize(options.minItems)] : []),
    ...(required && options.maxItems ? [ArrayMaxSize(options.maxItems)] : []),
  )
}
