import { IsSwaggerFile, IsSwaggerStringNumber, MimetypeImage } from '@/common'
import { MultipartFile, MultipartValue } from '@fastify/multipart'
import { Transform } from 'class-transformer'

export class UserUpdateDto {
  @IsSwaggerStringNumber({ required: false })
  @Transform(({ value }: { value: MultipartValue }) => value.value)
  phone?: string

  @IsSwaggerFile({ required: false }, Object.values(MimetypeImage))
  image?: MultipartFile
}
