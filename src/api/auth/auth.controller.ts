import { Route } from '@/app.constant'
import { GuardController } from '@/modules/guard/guard.controller'
import { Controller } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'

@Controller(Route.AUTH)
@ApiTags(Route.AUTH)
export class AuthController extends GuardController {
  constructor(
    protected readonly config: ConfigService,
    protected readonly service: AuthService,
  ) {
    super(service, config)
  }

  /**
   * Continue right your endpoint for another service like
   * Reset password, confirm password, ...etc
   */
}
