export interface IConfigBucket {
  name: string
  cloudfrontUrl: string
  cloudfrontKey: string
  cloudfrontKeyPairId: string
}

export interface IConfigS3 {
  region: string
  accessKey: string
  secretKey: string
  bucketPublic: IConfigBucket
  bucketSecret: IConfigBucket
}
