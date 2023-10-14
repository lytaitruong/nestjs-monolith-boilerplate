import { IsSwaggerDate, IsSwaggerEnum, IsSwaggerString } from '@/common'
import { Task, TaskStatus } from '@prisma/client'

export class TaskResultDto implements Partial<Task> {
  @IsSwaggerString()
  id: string

  @IsSwaggerString()
  title: string

  @IsSwaggerString()
  content: string

  @IsSwaggerString({ required: false, isArray: true })
  hashtag?: string[]

  @IsSwaggerEnum(TaskStatus, { required: false })
  status?: TaskStatus

  @IsSwaggerEnum(TaskStatus, { required: false })
  userId?: string

  @IsSwaggerDate({ required: false })
  createdAt?: Date

  @IsSwaggerDate({ required: false })
  updatedAt?: Date
}
