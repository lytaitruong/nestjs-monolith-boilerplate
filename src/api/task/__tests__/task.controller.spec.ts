import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { TaskController } from '../task.controller'
import { TaskService } from '../task.service'

describe('TaskController', () => {
  let controller: TaskController
  let service: DeepMocked<TaskService>

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [],
      controllers: [TaskController],
    })
      .useMocker(createMock)
      .compile()
    controller = module.get(TaskController)
    service = module.get(TaskService)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  afterAll(async () => {})

  it('should be defined', () => {
    expect(controller).toBeDefined()
    expect(service).toBeDefined()
  })

  describe('# GET', () => {
    it('Should return 200', async () => {
      service.getAll.mockResolvedValueOnce({ data: [], meta: {} as any })
    })
  })
})
