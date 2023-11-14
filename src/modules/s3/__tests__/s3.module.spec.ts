import { createMock } from '@golevelup/ts-jest'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { IConfigS3 } from '../s3.interface'
import { S3Module } from '../s3.module'
import { S3Service } from '../s3.service'

describe(`S3Module`, () => {
  let config: ConfigService

  beforeEach(() => {
    jest.resetModules()
  })
  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })
  it(`should be defined`, async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [S3Module],
      providers: [ConfigService],
    })
      .useMocker(createMock)
      .compile()
    config = module.get(ConfigService)

    expect(module).toBeDefined()
    expect(module.get(S3Service)).toBeInstanceOf(S3Service)
    expect(config).toBeDefined()

    expect(config.get('s3')).toEqual({
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
        name: process.env.AWS_BUCKET_SECRET,
        cloudfrontUrl: process.env.AWS_BUCKET_SECRET_CDN_URL,
        cloudfrontKey: process.env.AWS_BUCKET_SECRET_CDN_KEY,
        cloudfrontKeyPairId: process.env.AWS_BUCKET_SECRET_CDN_KEY_PAIR_ID,
      },
    } as IConfigS3)
  })
})
