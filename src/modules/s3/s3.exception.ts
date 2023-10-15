import { IAppError } from '@/common'
import { HttpStatus } from '@nestjs/common'

export type S3Code = 'UPLOAD_FAILED' | 'REMOVE_FAILED' | 'DOWNLOAD_FAILED'

export const S3_ERROR: Record<S3Code, IAppError> = {
  DOWNLOAD_FAILED: {
    name: `Download failed`,
    code: `0900`,
    message: `Download from s3 has been failed`,
    status: HttpStatus.FAILED_DEPENDENCY,
  },
  UPLOAD_FAILED: {
    name: `Upload failed`,
    code: `0901`,
    message: `Upload to s3 has been failed`,
    status: HttpStatus.FAILED_DEPENDENCY,
  },
  REMOVE_FAILED: {
    name: `Remove failed`,
    code: `0902`,
    message: `Delete file & folder in s3 has bene failed`,
    status: HttpStatus.FAILED_DEPENDENCY,
  },
}
