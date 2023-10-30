import { S3Module } from '@/modules/s3'
import { StripeModule } from '@/modules/stripe'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { BullBoardModule } from '@bull-board/nestjs'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { join } from 'path'
import { UserController } from './user.controller'
import { USER_IMAGE_PROCESSOR } from './user.interface'
import { UserService } from './user.service'

@Module({
  imports: [
    BullModule.registerQueue({
      name: USER_IMAGE_PROCESSOR,
      processors: [{ path: join(__dirname, 'processor/user-image.processor.js'), concurrency: 10 }],
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: { age: 3600, count: 1000 }, // expire 1 hour and just store 1000 latest job
        removeOnFail: { age: 3600 * 8, count: 5000 }, // expire 8 hour and just store 5000 latest job
      },
    }),
    BullBoardModule.forFeature({ name: USER_IMAGE_PROCESSOR, adapter: BullMQAdapter }),
    StripeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        apiKey: config.get<string>('stripe.secretKey'),
        options: { apiVersion: '2023-10-16' },
      }),
    }),
    S3Module,
  ],
  exports: [UserService],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
