import { Route } from '@/app.constant'
import { ApiPassedRes, IReq, UploadFormData } from '@/common'
import { JwtController, JwtInfo } from '@/modules/guard'
import { Body, HttpStatus, Post, Req } from '@nestjs/common'
import { FileCreateDto } from './file.dto'
import { FileCreateRes } from './file.res'
import { FileService } from './file.service'

@JwtController(Route.FILE)
export class FileController {
  constructor(private readonly service: FileService) {}

  @UploadFormData()
  @Post()
  @ApiPassedRes(FileCreateRes, HttpStatus.CREATED)
  create(@Req() req: IReq<JwtInfo>, @Body() data: FileCreateDto) {
    return this.service.create(req.user, data)
  }
}
