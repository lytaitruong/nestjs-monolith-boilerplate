import { createMock } from '@golevelup/ts-jest'
import { BullModule, getQueueOptionsToken, getQueueToken } from '@nestjs/bullmq'
import { CacheModule } from '@nestjs/cache-manager'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Queue } from 'bullmq'
import { join } from 'lodash'
import { USER_IMAGE_PROCESSOR } from '../user.interface'
import { UserService } from '../user.service'

describe(`UserService`, () => {
  let service: UserService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CacheModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: () => {
            return {}
          },
        }),
        BullModule.registerQueue({
          name: USER_IMAGE_PROCESSOR,
          processors: [{ path: join(__dirname, '../processor/user-image.processor.js'), concurrency: 10 }],
          defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
            removeOnComplete: { age: 3600, count: 1000 }, // expire 1 hour and just store 1000 latest job
            removeOnFail: { age: 3600 * 8, count: 5000 }, // expire 8 hour and just store 5000 latest job
          },
        }),
      ],
      providers: [UserService],
    })
      .useMocker(createMock)
      .overrideProvider(getQueueOptionsToken(USER_IMAGE_PROCESSOR))
      .useValue(createMock())
      .overrideProvider(getQueueToken(USER_IMAGE_PROCESSOR))
      .useValue(createMock<Queue>())
      .compile()

    service = module.get(UserService)
  })
  beforeEach(() => {
    jest.resetModules()
  })
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it(`should be defined`, () => {
    expect(service).toBeDefined()
  })
})
