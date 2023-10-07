import { ApiPassedRes, HEADERS, IRes } from '@/common'
import { HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { GuardCookieRes, GuardRefreshRes } from './guard.dto'
import { GuardCookie, GuardType, IGuardService, IReqJwt } from './guard.interface'
import { JwtAccessGuard } from './strategies/access.guard'
import { JwtRefreshGuard } from './strategies/refresh.guard'

export abstract class GuardController {
  constructor(
    protected readonly service: IGuardService,
    protected readonly config: ConfigService,
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
  @ApiPassedRes(GuardRefreshRes, HttpStatus.OK)
  @Post('refresh-token')
  async refreshToken(@Req() req: IReqJwt, @Res() res: IRes) {
    const maxAgeRefresh = req.user.exp - ((Date.now() / 1000) | 0)
    const token =
      req.cookies[GuardType.REFRESH] || // If a web
      req.headers[HEADERS.AUTHORIZATION].replace('Bearer ', '') // If a mobile
    const response = await this.service.refreshToken(req.user, token, maxAgeRefresh)
    return this.setCookie(res, response, maxAgeRefresh).send(response)
  }

  protected setCookie(
    res: IRes,
    response: GuardCookieRes,
    maxAgeRefresh = this.config.get('guard.jwt.refreshMaxAge'),
    maxAgeAccess = this.config.get('guard.jwt.accessMaxAge'),
  ) {
    return res
      .setCookie(GuardCookie.ACCESS_TOKEN, response.accessToken, { maxAge: maxAgeAccess })
      .setCookie(GuardCookie.REFRESH_TOKEN, response.refreshToken, { maxAge: maxAgeRefresh })
  }
}
