import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsBoolean, IsOptional, IsString, ValidateIf } from 'class-validator'
import { IsSwaggerArrayString } from '../document'
import { ApiPaginateLimit, IsLargeThan, IsSorted } from './pagination.decorator'
import { IPaginationParams, PAGINATION, Sort } from './pagination.interface'

export class PaginationOptionsDto {
  @ApiPaginateLimit({ default: PAGINATION.DEFAULT_PAGE }, PAGINATION.MAXIMUM_PAGE)
  readonly page: number = PAGINATION.DEFAULT_PAGE

  @ApiPaginateLimit({ default: PAGINATION.DEFAULT_SIZE }, PAGINATION.MAXIMUM_SIZE)
  readonly size: number = PAGINATION.DEFAULT_SIZE
}

export class PaginationRangeDto extends PaginationOptionsDto {
  @ApiProperty({ type: 'date', default: new Date(), required: false, description: 'Not Required' })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value && new Date(value))
  from?: Date

  @ValidateIf((o) => o.from)
  @ApiProperty({ type: 'date', default: new Date(), required: false, description: 'Not Required' })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value && new Date(value))
  @IsLargeThan<PaginationRangeDto>('from')
  to?: Date
}

export const PaginationQueryDto = <T>(sortEnum: T[]) => {
  class PaginationQuery extends PaginationRangeDto implements IPaginationParams<T> {
    @ApiProperty({ type: 'string', required: false, description: 'Not Required', example: '{"name":"desc"}' })
    @IsOptional()
    @Transform(({ value }: { value: string }) => value && JSON.parse(value))
    @IsSorted(sortEnum)
    sort?: { [data in keyof T]: Sort }

    @ApiProperty({ type: 'string', required: false, description: 'Not Required', example: 'name.createdAt' })
    @IsOptional()
    @Transform(({ value }: { value: string }) => value.toLowerCase().trim().split('.'))
    @IsSwaggerArrayString()
    filter?: keyof T[]

    @ApiProperty({ type: 'string', required: false, description: 'Not Required', example: 'daniel' })
    @IsOptional()
    @IsString()
    @Transform(({ value }: { value: string }) => value && value.toLowerCase().trim())
    search?: string

    @ApiProperty({ type: 'string', required: false, description: 'Not Required', example: 'true' })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }: { value: string }) => value && value === 'true')
    export?: boolean
  }
  return PaginationQuery
}
