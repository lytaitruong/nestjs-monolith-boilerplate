import { S3Service } from '@/modules/s3'
import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3'
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { IUserImageUploadData, USER_IMAGE_PROCESSOR } from '../user.interface'

/**
 * ! Sharp right now support limited for bunx so careful it
 * ? https://github.com/lovell/sharp/issues/3750#issuecomment-1751172728
 */
@Processor(USER_IMAGE_PROCESSOR, { concurrency: 10, limiter: { max: 10, duration: 10000 } })
export class UserImageProcessor extends WorkerHost {
  private readonly logger = new Logger(UserImageProcessor.name)

  constructor(private readonly s3: S3Service) {
    super()
  }

  async process(job: Job<IUserImageUploadData, CompleteMultipartUploadCommandOutput, string>) {
    const result = await this.s3.upload({
      Bucket: this.s3.bucketPublic,
      Key: job.data.name,
      Body: Buffer.from(job.data.data),
      ContentType: job.data.type,
    })
    return result
  }

  @OnWorkerEvent('completed')
  async onWorkerCompleted(data) {
    this.logger.log(data.returnvalue)
  }

  @OnWorkerEvent('failed')
  async onWorkerFailed(data: Job) {
    this.logger.error(data.failedReason)
  }
}
