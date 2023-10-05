import { AppException, scryptHash, scryptVerify } from '@/common'
import { GuardService, JwtInfo } from '@/modules/guard'
import { PrismaService } from '@/modules/prisma'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Status } from '@prisma/client'
import { AUTH_ERROR } from './auth.exception'
import { AuthRefreshRes } from './auth.res'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly guard: GuardService,
  ) {}

  async signOut(info: JwtInfo): Promise<void> {
    await this.isDeviceExistAndActive(info)

    await this.prisma.auth.update({
      where: { userId_device: { userId: info.sub, device: info.device } },
      data: { refreshToken: null },
      select: { provider: true },
    })
  }

  /**
   ** After 15 minutes -> the Access Token will be expire and end-user need using refresh token to renewable
   ** Assume you have 1 million user
   ** Assume user work 8 hours/day -> 8 * 1_000_000 = 8_000_000 request each 15 minutes (WoW - Bottleneck)
   *! Don't increase Access Token expire time -> Make your server security slow is not good options
   *TODO: Should make Refresh Token rotation in per day instead of each request but not change expire time
   *? Reference: https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/
   */
  async refreshToken(info: JwtInfo, token: string, maxAge: number): Promise<AuthRefreshRes> {
    const auth = await this.isDeviceExistAndActive(info)

    if (!auth.refreshToken || (await scryptVerify(token, auth.refreshToken)) === false) {
      //! Push notification to end-user, maybe the refresh-token has been stolen!!!
      //! Deactivate all access-refresh token to make the legitimate end-user sign in again
      throw new AppException(AUTH_ERROR.REFRESH_TOKEN_REVOKED)
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.guard.signed('access', { sub: info.sub, role: info.role, device: info.device }),
      this.guard.signed('refresh', { sub: info.sub, role: info.role, device: info.device }, maxAge),
    ])
    await this.prisma.auth.update({
      where: { userId_device: { userId: info.sub, device: info.device } },
      data: { refreshToken: await scryptHash(refreshToken) },
      select: { provider: true },
    })

    return {
      type: 'Bearer',
      accessToken,
      refreshToken,
    }
  }

  private async isDeviceExistAndActive(info: JwtInfo) {
    const auth = await this.prisma.auth.findUnique({
      where: { userId_device: { userId: info.sub, device: info.device } },
      select: { refreshToken: true, user: { select: { status: true } } },
    })
    if (!auth) throw new AppException(AUTH_ERROR.DEVICE_NOT_FOUND)
    if (auth.user.status !== Status.ACTIVE) {
      //! Deactivate all access-refresh token to make end-user can't be sign in anymore
      throw new AppException(AUTH_ERROR.USER_HAS_BEEN_DEACTIVATE)
    }
    return auth
  }
}
