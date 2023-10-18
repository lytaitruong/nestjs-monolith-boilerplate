import { S3Module } from '@/modules/s3'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { BullBoardModule } from '@bull-board/nestjs'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { UserImageProcessor } from './processor/user-image.processor'
import { UserController } from './user.controller'
import { USER_IMAGE_PROCESSOR } from './user.interface'
import { UserService } from './user.service'

@Module({
  imports: [
    S3Module,
    BullModule.registerQueue({
      name: USER_IMAGE_PROCESSOR,
      defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 1000 } },
    }),
    BullBoardModule.forFeature({ name: USER_IMAGE_PROCESSOR, adapter: BullMQAdapter }),
  ],
  exports: [UserService],
  providers: [UserService, UserImageProcessor],
  controllers: [UserController],
})
export class UserModule {}
