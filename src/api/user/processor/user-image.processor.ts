import { MimetypeImage } from '@/common'
import { S3Service } from '@/modules/s3'
import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3'
import { ConfigService } from '@nestjs/config'
import { Job } from 'bullmq'
import * as sharp from 'sharp'
import { IUserImageConverterData } from '../user.interface'

/**
 * ! Sharp right now support limited for bunx so careful it
 * ? https://github.com/lovell/sharp/issues/3750#issuecomment-1751172728
 */
export default async function (job: Job<IUserImageConverterData, CompleteMultipartUploadCommandOutput, string>) {
  const s3 = new S3Service(
    new ConfigService({
      s3: {
        region: process.env.AWS_REGION,
        accessKey: process.env.AWS_ACCESS_KEY,
        secretKey: process.env.AWS_SECRET_ACCESS_KEY,
        bucketPublic: {
          name: process.env.AWS_BUCKET_PUBLIC,
        },
        bucketSecret: {
          name: process.env.AWS_SECRET_BUCKET,
        },
      },
    }),
  )
  const result = await s3.upload({
    Bucket: s3.bucketPublic,
    Key: job.data.name,
    Body:
      job.data.type === MimetypeImage.IMAGE_WEBP
        ? Buffer.from(job.data.data)
        : await sharp(Buffer.from(job.data.data)).webp({ lossless: true }).toBuffer(),
    ContentType: job.data.type,
  })
  return result
}
