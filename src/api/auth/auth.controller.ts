import { Route } from '@/app.constant'
import { ApiPassedRes, HEADERS, IRes } from '@/common'
import { GuardCookie, GuardService, GuardType, IReqJwt, JwtAccessGuard, JwtRefreshGuard } from '@/modules/guard'
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

  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('sign-out')
  async signOut(@Req() req: IReqJwt, @Res() res: IRes) {
    const maxAgeRevoke = -1
    await this.service.signOut(req.user)

    return this.setCookie(res, { accessToken: '', refreshToken: '' }, maxAgeRevoke, maxAgeRevoke).send()
  }

  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiPassedRes(AuthRefreshRes, HttpStatus.CREATED)
  @Post('refresh-token')
  async refreshToken(@Req() req: IReqJwt, @Res() res: IRes) {
    const maxAgeRefresh = req.user.exp - ((Date.now() / 1000) | 0)
    const token =
      req.cookies[GuardType.REFRESH] || // If a web
      req.headers[HEADERS.AUTHORIZATION].replace('Bearer ', '') // If a mobile

    const response = await this.service.refreshToken(req.user, token, maxAgeRefresh)

    return this.setCookie(res, response, maxAgeRefresh).send(response)
  }

  private setCookie(
    res: IRes,
    response: AuthCookieRes,
    maxAgeRefresh = this.guard.maxAgeAccess,
    maxAgeAccess = this.guard.maxAgeRefresh,
  ) {
    return res
      .setCookie(GuardCookie.ACCESS_TOKEN, response.accessToken, { maxAge: maxAgeAccess })
      .setCookie(GuardCookie.REFRESH_TOKEN, response.refreshToken, { maxAge: maxAgeRefresh })
  }
}
