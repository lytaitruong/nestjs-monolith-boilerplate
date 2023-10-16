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
          bucketPublic: {
            name: process.env.AWS_BUCKET_PUBLIC,
            cloudfrontUrl: process.env.AWS_BUCKET_PUBLIC_CDN_URL,
            cloudfrontKey: process.env.AWS_BUCKET_PUBLIC_CDN_KEY,
            cloudfrontKeyPairId: process.env.AWS_BUCKET_PUBLIC_CDN_KEY_PAIR_ID,
          },
          bucketSecret: {
            name: process.env.AWS_SECRET_BUCKET,
            cloudfrontUrl: process.env.AWS_BUCKET_SECRET_CDN_URL,
            cloudfrontKey: process.env.AWS_BUCKET_SECRET_CDN_KEY,
            cloudfrontKeyPairId: process.env.AWS_BUCKET_SECRET_CDN_KEY_PAIR_ID,
          },
        }),
      ),
    ),
  ],
  exports: [S3Service],
  providers: [S3Service],
})
export class S3Module {}
