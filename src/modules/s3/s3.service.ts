import { AppException } from '@/common'
import {
  CompleteMultipartUploadCommandOutput,
  DeleteObjectsCommand,
  DeleteObjectsCommandOutput,
  GetObjectCommand,
  GetObjectCommandInput,
  GetObjectCommandOutput,
  PutObjectCommandInput,
  S3Client,
  Tag,
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { S3_ERROR } from './s3.exception'

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name)
  private readonly client: S3Client
  constructor(private readonly config: ConfigService) {
    this.client = new S3Client({
      region: this.config.get('s3.region'),
      credentials: {
        accessKeyId: this.config.get('s3.accessKey'),
        secretAccessKey: this.config.get('s3.secretKey'),
      },
    })
  }
  get bucketPublic() {
    return this.config.get('s3.bucketPublic')
  }
  get bucketSecret() {
    return this.config.get('s3.bucketSecret')
  }

  async upload(params: PutObjectCommandInput, tags: Tag[] = []): Promise<CompleteMultipartUploadCommandOutput> {
    try {
      const parallelUploads3 = new Upload({
        tags,
        params,
        client: this.client,
        partSize: 1024 * 1024 * 5, // 5mb
        queueSize: 4,
        leavePartsOnError: false,
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      parallelUploads3.on('httpUploadProgress', (_progress) => {
        // const percentage = Math.round((progress.loaded / progress.total) * 100)
        //! You can add Pusher to make Real-time Progress Bar
        //? https://pusher.com/blog/improve-user-experience-app-real-time-progress-bar-tutorial/
      })
      const result = (await parallelUploads3.done()) as CompleteMultipartUploadCommandOutput
      return result
    } catch (error) {
      this.logger.error(error.message, error.stack)
      throw new AppException(S3_ERROR.UPLOAD_FAILED)
    }
  }

  async remove(Bucket: string, Key: string[]): Promise<DeleteObjectsCommandOutput> {
    try {
      const request = new DeleteObjectsCommand({
        Bucket: Bucket,
        Delete: {
          Objects: Key.map((key) => ({ Key: key })),
          Quiet: false,
        },
      })
      const result = await this.client.send(request)
      return result
    } catch (error) {
      this.logger.error(error.message, error.stack)
      throw new AppException(S3_ERROR.DOWNLOAD_FAILED)
    }
  }

  async download(
    Bucket: string,
    Key: string,
    options: Omit<GetObjectCommandInput, 'Bucket' | 'Key'> = {},
  ): Promise<GetObjectCommandOutput> {
    try {
      const request = new GetObjectCommand({
        Bucket,
        Key: Key.startsWith('/') ? Key.slice(1, Key.length) : Key,
        ...options,
      })
      const result = await this.client.send(request)
      return result
    } catch (error) {
      this.logger.error(error.message, error.stack)
      throw new AppException(S3_ERROR.DOWNLOAD_FAILED)
    }
  }
}
