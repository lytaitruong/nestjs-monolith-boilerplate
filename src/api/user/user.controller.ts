import { Route } from '@/app.constant'
import { ApiPassedRes, IReq, UploadFormData } from '@/common'
import { GuardController, JwtInfo } from '@/modules/guard'
import { Body, Get, Logger, Patch, Req } from '@nestjs/common'
import { UserUpdateDto } from './user.dto'
import { UserProfileRes } from './user.res'
import { UserService } from './user.service'

@GuardController(Route.USER)
export class UserController {
  private readonly logger = new Logger(UserController.name)

  constructor(private readonly service: UserService) {}

  @Get('profile')
  @ApiPassedRes(UserProfileRes)
  getOne(@Req() req: IReq<JwtInfo>) {
    return this.service.getOne(req.user)
  }

  @UploadFormData()
  @Patch('profile')
  @ApiPassedRes(UserProfileRes)
  updateProfile(@Req() req: IReq<JwtInfo>, @Body() data: UserUpdateDto) {
    return this.service.update(req.user, data)
  }
}
