import { ApiProperty } from '@nestjs/swagger'
import type { IPaginationMeta, IPaginationRes } from './pagination.interface'

export class PaginateMetaDto implements IPaginationMeta {
  @ApiProperty({ example: 10 })
  page: number

  @ApiProperty({ example: 10 })
  last: number

  @ApiProperty({ example: 10 })
  size: number

  @ApiProperty({ example: 2 })
  next: number | null

  @ApiProperty({ example: null })
  prev: number | null

  @ApiProperty({ example: 100 })
  total: number
}

export class PaginatedResponseDto<T> implements IPaginationRes<T> {
  @ApiProperty()
  data: T[]

  @ApiProperty()
  meta: PaginateMetaDto
}
