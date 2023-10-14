import { IsSwaggerEnum, IsSwaggerString, PaginationQueryDto } from '@/common'
import { PartialType } from '@nestjs/swagger'
import { Prisma, TaskStatus } from '@prisma/client'

export class TaskQueryDto extends PaginationQueryDto(Object.values(Prisma.TaskScalarFieldEnum)) {}

export class TaskParamDto {
  @IsSwaggerString()
  id: string
}

export class TaskCreateDto implements Omit<Prisma.TaskCreateInput, 'user'> {
  @IsSwaggerString()
  title: string

  @IsSwaggerString()
  content: string

  @IsSwaggerString({ required: true, isArray: true })
  hashtag: string[]
}

export class TaskUpdateDto extends PartialType(TaskCreateDto) {
  @IsSwaggerEnum(TaskStatus, { required: false })
  status?: TaskStatus
}
