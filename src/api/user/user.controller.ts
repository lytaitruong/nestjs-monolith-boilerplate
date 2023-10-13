import { Route } from '@/app.constant'
import { ApiPassedRes, IReq } from '@/common'
import { GuardController, JwtInfo } from '@/modules/guard'
import { Get, Logger, Req } from '@nestjs/common'
import { UserProfileRes } from './user.res'
import { UserService } from './user.service'

@GuardController(Route.USER)
export class UserController {
  private readonly logger = new Logger(UserController.name)

  constructor(private readonly service: UserService) {}

  @Get('profile')
  @ApiPassedRes(UserProfileRes)
  getProfile(@Req() req: IReq<JwtInfo>) {
    return this.service.getProfile(req.user)
  }
}
