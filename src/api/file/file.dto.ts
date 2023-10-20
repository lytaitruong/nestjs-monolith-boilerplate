import { IsSwaggerFile, MimetypeDocument } from '@/common'
import { MultipartFile } from '@fastify/multipart'

export class FileCreateDto {
  @IsSwaggerFile({ required: true }, [MimetypeDocument.CSV])
  file: MultipartFile
}
