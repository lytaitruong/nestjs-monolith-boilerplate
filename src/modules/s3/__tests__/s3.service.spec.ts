import { mockClient } from 'aws-sdk-client-mock'
import 'aws-sdk-client-mock-jest'

import { AppException } from '@/common'
import {
  CreateMultipartUploadCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from '@aws-sdk/client-s3'
import { sdkStreamMixin } from '@aws-sdk/util-stream-node'
import { createMock } from '@golevelup/ts-jest'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Readable } from 'stream'
import { S3_ERROR } from '../s3.exception'
import { configS3 } from '../s3.module'
import { S3Service } from '../s3.service'

const s3Mock = mockClient(S3Client)

describe(`S3Service`, () => {
  let service: S3Service

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ cache: false, envFilePath: ['.env'], load: [configS3] })],
      providers: [S3Service],
    })
      .useMocker(createMock)
      .compile()

    service = module.get<S3Service>(S3Service)
  })
  beforeEach(() => {
    s3Mock.reset()
    jest.resetModules()
  })
  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  it(`should be defined`, () => {
    expect(service).toBeDefined()
    expect(service.bucketPublic).toEqual(process.env.AWS_BUCKET_PUBLIC)
    expect(service.bucketSecret).toEqual(process.env.AWS_BUCKET_SECRET)
  })

  describe(`upload`, () => {
    it(`Should Upload S3 successfully`, async () => {
      const params = {
        Bucket: service.bucketPublic,
        Key: 'images/avatar.png',
        Body: Buffer.from('streaming-data'),
      }
      s3Mock.on(CreateMultipartUploadCommand).resolves({ UploadId: '1' })
      s3Mock.on(UploadPartCommand).resolves({ ETag: '1' })

      const response = await service.upload(params)

      expect(s3Mock).toHaveReceivedCommand(PutObjectCommand)
      expect(s3Mock).toHaveReceivedCommandTimes(PutObjectCommand, 1)
      expect(s3Mock).toHaveReceivedCommandWith(PutObjectCommand, params)
      expect(response).toEqual({
        Bucket: service.bucketPublic,
        Key: 'images/avatar.png',
        Location: 'https://nestjs-public.s3.ap-southeast-1.amazonaws.com/images/avatar.png',
      })
    })

    it(`should throw REMOVE_FAILED with code 902 if key not found`, async () => {
      const params = {
        Bucket: service.bucketPublic,
        Key: 'images/avatar.png',
        Body: Buffer.from('streaming-data'),
      }
      s3Mock.on(PutObjectCommand).rejects()

      expect.assertions(6)
      try {
        await service.upload(params)
      } catch (error) {
        expect(s3Mock).toHaveReceivedCommand(PutObjectCommand)
        expect(s3Mock).toHaveReceivedCommandTimes(PutObjectCommand, 1)
        expect(s3Mock).toHaveReceivedCommandWith(PutObjectCommand, params)
        expect(error).toBeInstanceOf(AppException)
        expect(error.error).toMatchObject(S3_ERROR.UPLOAD_FAILED)
      }
    })
  })

  describe(`remove`, () => {
    it(`should delete successfully object in s3`, async () => {
      s3Mock.on(DeleteObjectsCommand).resolves({ Deleted: [{ Key: '/images/avatar.png' }] })

      const response = await service.remove('bucketPublic', ['/images/avatar.png'])

      expect.assertions(6)
      expect(s3Mock).toHaveReceivedCommand(DeleteObjectsCommand)
      expect(s3Mock).toHaveReceivedCommandTimes(DeleteObjectsCommand, 1)
      expect(s3Mock).toHaveReceivedCommandWith(DeleteObjectsCommand, {
        Bucket: 'bucketPublic',
        Delete: {
          Quiet: false,
          Objects: [{ Key: '/images/avatar.png' }],
        },
      })
      expect(response).toBeTruthy()
      expect(response.Deleted).toEqual([{ Key: '/images/avatar.png' }])
    })

    it(`should throw REMOVE_FAILED with code 902 if key not found`, async () => {
      s3Mock.on(DeleteObjectsCommand).rejects()

      expect.assertions(6)
      try {
        await service.remove('bucketPublic', ['/images/avatar.png'])
      } catch (error) {
        expect(s3Mock).toHaveReceivedCommand(DeleteObjectsCommand)
        expect(s3Mock).toHaveReceivedCommandTimes(DeleteObjectsCommand, 1)
        expect(s3Mock).toHaveReceivedCommandWith(DeleteObjectsCommand, {
          Bucket: 'bucketPublic',
          Delete: {
            Quiet: false,
            Objects: [{ Key: '/images/avatar.png' }],
          },
        })
        expect(error).toBeInstanceOf(AppException)
        expect(error.error).toMatchObject(S3_ERROR.REMOVE_FAILED)
      }
    })
  })

  describe(`download`, () => {
    it(`should return streaming data`, async () => {
      const stream = new Readable()
      stream.push('Hello World')
      stream.push(null)

      s3Mock.on(GetObjectCommand).resolves({
        Body: sdkStreamMixin(stream),
      })
      const response = await service.download('bucketPublic', '/images/avatar.png')

      expect.assertions(7)
      expect(s3Mock).toHaveReceivedCommand(GetObjectCommand)
      expect(s3Mock).toHaveReceivedCommandTimes(GetObjectCommand, 1)
      expect(s3Mock).toHaveReceivedCommandWith(GetObjectCommand, {
        Bucket: 'bucketPublic',
        Key: 'images/avatar.png',
      })
      expect(response).toBeTruthy()
      expect(response.Body).toBeInstanceOf(Readable)
      expect(await response.Body.transformToString()).toBe('Hello World')
    })

    it(`should throw DOWNLOAD_FAILED with code 900 if key not found`, async () => {
      s3Mock.on(GetObjectCommand).rejects()

      expect.assertions(6)
      try {
        await service.download('bucketPublic', 'images/avatar.png')
      } catch (error) {
        expect(s3Mock).toHaveReceivedCommand(GetObjectCommand)
        expect(s3Mock).toHaveReceivedCommandTimes(GetObjectCommand, 1)
        expect(s3Mock).toHaveReceivedCommandWith(GetObjectCommand, { Bucket: 'bucketPublic', Key: 'images/avatar.png' })
        expect(error).toBeInstanceOf(AppException)
        expect(error.error).toMatchObject(S3_ERROR.DOWNLOAD_FAILED)
      }
    })
  })

  describe(`getSignedUrl`, () => {
    it(`should return Cloudfront URL without policies`, async () => {
      const response = await service.getSignURL(
        'bucketPublic',
        process.env.AWS_BUCKET_SECRET_CDN_URL,
        new Date('2023-12-12T00:00:00.000Z'),
      )
      expect(response).toEqual(
        'https://d24n0jc6ofxt5o.cloudfront.net/https://d1s4i1p8laxee2.cloudfront.net?Expires=1702339200&Key-Pair-Id=K14WVOC4K27BG9&Signature=Wa3kJoTQN-mqURxEWw8ABpVh-2-LXUumC5w3niieiRvCw~0f~EmhtOFFKTrwYur0ATO~O3eOL87Qu6xsssNarxgWP75LopFSqaX7CzJnihJjtVdt3o7cC47GZcF3BwHk7naVh~x8eylj2hXxaT0DOg4jQU1nDxrEpxVt4qofDwBa9TnnWxwdhfLrW4jiArv1DZle45HvrLXenYEHeO-NPK8ffMpNHt5yVkJH1i3n0LBUKKIT~vYfAEPC35FJ71CFMtW3gSAfZisVc0xV~DRz9Ku4kGOYXX8Oy0jvhRbngiC6QwY5CQnxVx5ciOIjnygOQlJ9lY8ZI88kaaAqxnXXZQ__',
      )
    })

    it(`should return Cloudfront URL with Policy allow list IP Address to get resources`, async () => {
      const response = await service.getSignURL(
        'bucketPublic',
        process.env.AWS_BUCKET_SECRET_CDN_URL,
        new Date('2023-12-12T00:00:00.000Z'),
        '192.168.0.1',
      )
      expect(response).toEqual(
        'https://d24n0jc6ofxt5o.cloudfront.net/https://d1s4i1p8laxee2.cloudfront.net?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9kMjRuMGpjNm9meHQ1by5jbG91ZGZyb250Lm5ldC9odHRwczovL2QxczRpMXA4bGF4ZWUyLmNsb3VkZnJvbnQubmV0IiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzAyMzM5MjAwfSwiSXBBZGRyZXNzIjp7IkFXUzpTb3VyY2VJcCI6IjE5Mi4xNjguMC4xLzMyIn19fV19&Key-Pair-Id=K14WVOC4K27BG9&Signature=MB7XzEv3S2OuqiLxPux0GkysnoQTExS3wIhV~6CZ6Q6ALY6p-lxA3eSXKYPWB4a9jVboOh3tCuU1n~2chJ5u61hpy5jrHVxs1d~27BBkhtZKjf-lYjepsDWchuw09b07N0KrK4ETmFEJZ8c3MbN2BBYLljQi6UZ1qr1o3E8liiFUKFJ2nf75b9XRIVdBIG76fPCNKh95x4eK~1aBraVQTksGWqR80fCEXD9wFmX4NPVTcODjI~1OSSs260b7YOfLCvPD2qY0XlIkX9jIwkdTQgmgEw12O9lFMNPsWea-zizni4VShRlU0wfK0ZDgMi7tbjatMk4AvEE1G-Nz9Yp2BQ__',
      )
    })
  })

  describe(`getSignCookie`, () => {
    it(`should return Cloudfront Object without policies`, async () => {
      const response = await service.getSignCookie(
        'bucketPublic',
        process.env.AWS_BUCKET_SECRET_CDN_URL,
        new Date('2023-12-12T00:00:00.000Z'),
      )
      expect(response).toEqual({
        'CloudFront-Expires': 1702339200,
        'CloudFront-Key-Pair-Id': 'K14WVOC4K27BG9',
        'CloudFront-Signature':
          'Wa3kJoTQN-mqURxEWw8ABpVh-2-LXUumC5w3niieiRvCw~0f~EmhtOFFKTrwYur0ATO~O3eOL87Qu6xsssNarxgWP75LopFSqaX7CzJnihJjtVdt3o7cC47GZcF3BwHk7naVh~x8eylj2hXxaT0DOg4jQU1nDxrEpxVt4qofDwBa9TnnWxwdhfLrW4jiArv1DZle45HvrLXenYEHeO-NPK8ffMpNHt5yVkJH1i3n0LBUKKIT~vYfAEPC35FJ71CFMtW3gSAfZisVc0xV~DRz9Ku4kGOYXX8Oy0jvhRbngiC6QwY5CQnxVx5ciOIjnygOQlJ9lY8ZI88kaaAqxnXXZQ__',
      })
    })

    it(`should return Cloudfront Object with Policy allow list IP Address to get resources`, async () => {
      const response = await service.getSignCookie(
        'bucketPublic',
        process.env.AWS_BUCKET_SECRET_CDN_URL,
        new Date('2023-12-12T00:00:00.000Z'),
        '192.168.0.1',
      )
      expect(response).toEqual({
        'CloudFront-Key-Pair-Id': 'K14WVOC4K27BG9',
        'CloudFront-Policy':
          'eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9kMjRuMGpjNm9meHQ1by5jbG91ZGZyb250Lm5ldC9odHRwczovL2QxczRpMXA4bGF4ZWUyLmNsb3VkZnJvbnQubmV0IiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzAyMzM5MjAwfSwiSXBBZGRyZXNzIjp7IkFXUzpTb3VyY2VJcCI6IjE5Mi4xNjguMC4xLzMyIn19fV19',
        'CloudFront-Signature':
          'MB7XzEv3S2OuqiLxPux0GkysnoQTExS3wIhV~6CZ6Q6ALY6p-lxA3eSXKYPWB4a9jVboOh3tCuU1n~2chJ5u61hpy5jrHVxs1d~27BBkhtZKjf-lYjepsDWchuw09b07N0KrK4ETmFEJZ8c3MbN2BBYLljQi6UZ1qr1o3E8liiFUKFJ2nf75b9XRIVdBIG76fPCNKh95x4eK~1aBraVQTksGWqR80fCEXD9wFmX4NPVTcODjI~1OSSs260b7YOfLCvPD2qY0XlIkX9jIwkdTQgmgEw12O9lFMNPsWea-zizni4VShRlU0wfK0ZDgMi7tbjatMk4AvEE1G-Nz9Yp2BQ__',
      })
    })
  })
})
