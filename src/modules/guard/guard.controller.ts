import { ApiPassedRes, AppException, HEADERS, IReq, IRes } from '@/common'
import { Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { IDevice } from 'ua-parser-js'
import { Device } from './guard.decorator'
import { GuardCookieRes, GuardOauth2Res, GuardRefreshRes } from './guard.dto'
import { GUARD_ERROR } from './guard.exception'
import { GuardCookie, GuardType, IGuardService, IReqOauth2, JwtInfo } from './guard.interface'
import { GithubOauth2Guard } from './oauth/github.guard'
import { GoogleOauth2Guard } from './oauth/google.guard'
import { JwtAccessGuard } from './strategies/access.guard'
import { JwtRefreshGuard } from './strategies/refresh.guard'

export abstract class GuardController {
  constructor(
    protected readonly service: IGuardService,
    protected readonly config: ConfigService,
  ) {}

  @UseGuards(JwtAccessGuard)
  @Post('sign-out')
  @HttpCode(HttpStatus.NO_CONTENT)
  async signOut(@Req() req: IReq<JwtInfo>, @Res() res: IRes) {
    const maxAgeRevoke = -1
    await this.service.signOut(req.user)
    return this.setCookie(res, { accessToken: '', refreshToken: '' }, maxAgeRevoke, maxAgeRevoke).send()
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh-token')
  @ApiPassedRes(GuardRefreshRes, HttpStatus.OK)
  async refreshToken(@Req() req: IReq<JwtInfo>, @Res() res: IRes) {
    const maxAgeRefresh = req.user.exp - ((Date.now() / 1000) | 0)
    const token =
      // If a web
      req.cookies[GuardType.REFRESH] ||
      // If a mobile
      req.headers[HEADERS.AUTHORIZATION].replace('Bearer ', '')
    const response = await this.service.refreshToken(req.user, token, maxAgeRefresh)
    return this.setCookie(res, response, maxAgeRefresh).send(response)
  }

  @UseGuards(GoogleOauth2Guard)
  @Get('google')
  async googleAuth() {}

  @UseGuards(GoogleOauth2Guard)
  @Get('google-redirect')
  @ApiPassedRes(GuardOauth2Res, HttpStatus.OK)
  async googleRedirect(@Req() req: IReqOauth2, @Device() device: IDevice, @Res() res: IRes) {
    if (!req.state) throw new AppException(GUARD_ERROR.OAUTH2_STATE_INVALID)

    const response = await this.service.oauth2(req.user, device)
    return this.setCookie(res, response).send(response)
  }

  @UseGuards(GithubOauth2Guard)
  @Get('github')
  async githubAuth() {}

  @UseGuards(GithubOauth2Guard)
  @Get('github-redirect')
  @ApiPassedRes(GuardOauth2Res, HttpStatus.OK)
  async githubRedirect(@Req() req: IReqOauth2, @Device() device: IDevice, @Res() res: IRes) {
    if (!req.state) throw new AppException(GUARD_ERROR.OAUTH2_STATE_INVALID)

    const response = await this.service.oauth2(req.user, device)
    return this.setCookie(res, response).send(response)
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
