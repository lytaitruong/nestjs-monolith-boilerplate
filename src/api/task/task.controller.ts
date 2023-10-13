import { Route } from '@/app.constant'
import { BaseController } from '@/common'
import { GuardController } from '@/modules/guard'
import { TaskCreateDto, TaskParamDto, TaskQueryDto, TaskUpdateDto } from './task.dto'
import { TaskResultDto } from './task.res'
import { TaskService } from './task.service'

@GuardController(Route.TASK)
export class TaskController extends BaseController(
  TaskResultDto,
  TaskCreateDto,
  TaskUpdateDto,
  TaskParamDto,
  TaskQueryDto,
) {
  constructor(public readonly service: TaskService) {
    super(service)
  }
}
