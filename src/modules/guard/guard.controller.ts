import { ApiPassedRes, HEADERS, IRes } from '@/common'
import { Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { GuardCookieRes, GuardOauth2Res, GuardRefreshRes } from './guard.dto'
import { GuardCookie, GuardType, IGuardService, IReqJwt, IReqOauth2 } from './guard.interface'
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

  @UseGuards(GoogleOauth2Guard)
  @Get('google')
  async googleAuth() {}

  @UseGuards(GoogleOauth2Guard)
  @HttpCode(HttpStatus.OK)
  @ApiPassedRes(GuardOauth2Res, HttpStatus.OK)
  @Get('google-redirect')
  async googleRedirect(@Req() req: IReqOauth2, @Res() res: IRes) {
    const response = await this.service.oauth2(req.user)
    return this.setCookie(res, response).send(response)
  }

  @UseGuards(GithubOauth2Guard)
  @Get('github')
  async githubAuth() {}

  @UseGuards(GithubOauth2Guard)
  @HttpCode(HttpStatus.OK)
  @ApiPassedRes(GuardOauth2Res, HttpStatus.OK)
  @Get('github-redirect')
  async githubRedirect(@Req() req: IReqOauth2, @Res() res: IRes) {
    const response = await this.service.oauth2(req.user)
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
