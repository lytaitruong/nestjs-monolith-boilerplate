import { FastifyAdapter } from '@bull-board/fastify'
import { BullBoardModule } from '@bull-board/nestjs'
import { createMock } from '@golevelup/ts-jest'
import { getQueueToken } from '@nestjs/bullmq'
import { CacheModule } from '@nestjs/cache-manager'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Queue } from 'bullmq'
import { UserController } from '../user.controller'
import { USER_IMAGE_PROCESSOR } from '../user.interface'
import { UserModule } from '../user.module'
import { UserService } from '../user.service'

describe(`UserModule`, () => {
  it(`should be defined`, async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CacheModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: () => {
            return {}
          },
        }),
        BullBoardModule.forRoot({ adapter: FastifyAdapter, route: 'queues' }),
        UserModule,
      ],
    })
      .useMocker(createMock)
      .overrideProvider(getQueueToken(USER_IMAGE_PROCESSOR))
      .useValue(createMock<Queue>())
      .compile()

    expect(module).toBeDefined()
    expect(module.get(UserService)).toBeDefined()
    expect(module.get(UserController)).toBeDefined()
  })
})
