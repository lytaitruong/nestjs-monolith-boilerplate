import { Module } from '@nestjs/common'
import { ConfigModule, registerAs } from '@nestjs/config'
import { IConfigS3 } from './s3.interface'
import { S3Service } from './s3.service'

@Module({
  imports: [
    ConfigModule.forFeature(
      registerAs(
        's3',
        (): IConfigS3 => ({
          region: process.env.AWS_REGION,
          accessKey: process.env.AWS_ACCESS_KEY,
          secretKey: process.env.AWS_SECRET_ACCESS_KEY,
          bucketPublic: process.env.AWS_BUCKET_PUBLIC,
          bucketSecret: process.env.AWS_SECRET_BUCKET,
        }),
      ),
    ),
  ],
  exports: [S3Service],
  providers: [S3Service],
})
export class S3Module {}
