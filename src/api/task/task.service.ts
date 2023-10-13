import { Pag, Res } from '@/common'
import { IBaseService } from '@/common/base'
import { JwtInfo } from '@/modules/guard'
import { PrismaService } from '@/modules/prisma'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Prisma, Task } from '@prisma/client'
import { createPaginator } from 'prisma-pagination'
import { TaskCreateDto, TaskParamDto, TaskQueryDto, TaskUpdateDto } from './task.dto'
import { TaskResultDto } from './task.res'

@Injectable()
export class TaskService
  implements IBaseService<TaskResultDto, TaskCreateDto, TaskUpdateDto, TaskParamDto, TaskQueryDto, JwtInfo>
{
  private readonly paginate = createPaginator({ perPage: 10, page: 1 })
  private readonly logger = new Logger(TaskService.name)

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}
  async getAll(info: JwtInfo, _param: TaskParamDto, query: TaskQueryDto): Promise<Pag<TaskResultDto>> {
    const result = await this.paginate<Task, Prisma.TaskFindManyArgs>(
      this.prisma.task,
      {
        where: { userId: info.sub },
      },
      { page: query.page, perPage: query.size },
    )
    return result
  }

  async create(info: JwtInfo, _param: TaskParamDto, data: TaskCreateDto): Promise<Res<TaskResultDto>> {
    return this.prisma.task.create({ data: { ...data, userId: info.sub } })
  }

  async update(info: JwtInfo, param: TaskParamDto, data: TaskUpdateDto): Promise<Res<TaskResultDto>> {
    return this.prisma.task.update({ where: { userId: info.sub, id: param.id }, data })
  }

  async getOne(info: JwtInfo, param: TaskParamDto): Promise<Res<TaskResultDto>> {
    return this.prisma.task.findUnique({ where: { userId: info.sub, id: param.id } })
  }

  async remove(info: JwtInfo, param: TaskParamDto): Promise<Res<TaskResultDto>> {
    return this.prisma.task.delete({ where: { userId: info.sub, id: param.id } })
  }
}
