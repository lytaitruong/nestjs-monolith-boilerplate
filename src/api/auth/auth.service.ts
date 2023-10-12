import { AppException, scryptHash, scryptVerify } from '@/common'
import { GuardService, IGuardService, JwtInfo, Oauth2Info } from '@/modules/guard'
import { GuardRefreshRes } from '@/modules/guard/guard.dto'
import { PrismaService } from '@/modules/prisma'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createId } from '@paralleldrive/cuid2'
import { Provider, Role, Status } from '@prisma/client'
import { IDevice } from 'ua-parser-js'
import { AUTH_ERROR } from './auth.exception'
import { AuthOauth2Res } from './auth.res'

@Injectable()
export class AuthService implements IGuardService {
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
      select: { userId: true },
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
  async refreshToken(info: JwtInfo, token: string, maxAge: number): Promise<GuardRefreshRes> {
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
      select: { userId: true },
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

  async oauth2(info: Oauth2Info, agentDevice: IDevice): Promise<AuthOauth2Res> {
    const device = `${agentDevice.vendor} + ${agentDevice.model} + ${agentDevice.type}`.trim()

    const user = await this.prisma.user.findUnique({
      where: { email: info.email },
      select: { id: true, email: true, image: true, status: true, provider: true, auth: { where: { device } } },
    })
    const sub = createId()
    const [accessToken, refreshToken] = await Promise.all([
      this.guard.signed('access', { sub: user?.id ?? sub, device, role: Role.USER }),
      this.guard.signed('refresh', { sub: user?.id ?? sub, device, role: Role.USER }),
    ])
    if (user) {
      if (user.provider !== info.provider.toUpperCase()) {
        const error = Object.assign({}, AUTH_ERROR.EMAIL_EXIST)
        error.message += ` via ${user.provider}`
        throw new AppException(error)
      }
      if (user.status !== Status.ACTIVE) throw new AppException(AUTH_ERROR.USER_HAS_BEEN_DEACTIVATE)
      if (!user.auth) {
        //! Warning legitimate user, are they login a new device or not ? If not banned all device
      }
      await this.prisma.auth.upsert({
        where: { userId_device: { userId: user.id, device } },
        create: { userId: user.id, device, refreshToken: await scryptHash(refreshToken) },
        update: { refreshToken: await scryptHash(refreshToken) },
      })

      return { user, accessToken, refreshToken }
    }
    const newUser = await this.prisma.user.create({
      data: {
        id: sub,
        email: info.email,
        phone: info.phone,
        image: info.image,
        provider: info.provider.toUpperCase() === Provider.GOOGLE ? Provider.GOOGLE : Provider.GITHUB,
        auth: { create: { device, refreshToken: await scryptHash(refreshToken) } },
      },
      select: { id: true, email: true, image: true, state: true, gender: true, createdAt: true },
    })
    return { user: newUser, accessToken, refreshToken }
  }
}
