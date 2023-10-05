import { Route } from '@/app.constant'
import { ApiPassedRes } from '@/common'
import { GuardController, IReqJwt } from '@/modules/guard'
import { Get, Logger, Req } from '@nestjs/common'
import { UserProfileRes } from './user.res'
import { UserService } from './user.service'

@GuardController(Route.USER)
export class UserController {
  private readonly logger = new Logger(UserController.name)

  constructor(private readonly service: UserService) {}

  @ApiPassedRes(UserProfileRes)
  @Get('profile')
  getProfile(@Req() req: IReqJwt) {
    return this.service.getProfile(req.user)
  }
}
