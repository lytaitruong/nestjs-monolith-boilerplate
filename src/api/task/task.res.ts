import { IsSwaggerArrayString, IsSwaggerDate, IsSwaggerEnum, IsSwaggerString } from '@/common'
import { Task, TaskStatus } from '@prisma/client'

export class TaskResultDto implements Partial<Task> {
  @IsSwaggerString({ required: true })
  id: string

  @IsSwaggerString({ required: true })
  title: string

  @IsSwaggerString({ required: true })
  content: string

  @IsSwaggerArrayString({ required: false })
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
