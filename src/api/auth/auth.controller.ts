import { Route } from '@/app.constant'
import { ApiPassedRes, HEADERS, IRes } from '@/common'
import { GuardCookie, GuardService, GuardType, IReqJwt, JwtRefreshGuard } from '@/modules/guard'
import { Controller, HttpCode, HttpStatus, Logger, Post, Req, Res, UseGuards } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiTags } from '@nestjs/swagger'
import { AuthCookieRes, AuthRefreshRes } from './auth.res'
import { AuthService } from './auth.service'

@Controller(Route.AUTH)
@ApiTags(Route.AUTH)
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

  constructor(
    private readonly config: ConfigService,
    private readonly service: AuthService,
    private readonly guard: GuardService,
  ) {}

  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiPassedRes(AuthRefreshRes, HttpStatus.CREATED)
  @Post('refresh-token')
  async refreshToken(@Req() req: IReqJwt, @Res() res: IRes) {
    const maxAge = req.user.exp - ((Date.now() / 1000) | 0)
    const token =
      req.cookies[GuardType.REFRESH] || // If a web
      req.headers[HEADERS.AUTHORIZATION].replace('Bearer ', '') // If a mobile

    const response = await this.service.refreshToken(req.user, token, maxAge)

    return this.setCookie(res, response, maxAge).send(response)
  }

  private setCookie(res: IRes, response: AuthCookieRes, maxAge?: number) {
    return res
      .setCookie(GuardCookie.ACCESS_TOKEN, response.accessToken, { maxAge: this.guard.maxAgeAccess })
      .setCookie(GuardCookie.REFRESH_TOKEN, response.refreshToken, { maxAge: maxAge ?? this.guard.maxAgeRefresh })
  }
}
