import { IsSwaggerString } from '@/common'

export class FileCreateRes {
  @IsSwaggerString()
  id: string
}
