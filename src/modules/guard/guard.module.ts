import { Module } from '@nestjs/common'
import { ConfigModule, registerAs } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { IConfigGuard } from './guard.interface'
import { GuardService } from './guard.service'
import { JwtAccessStrategy } from './strategies/access.guard'
import { JwtRefreshStrategy } from './strategies/refresh.guard'

@Module({
  imports: [
    ConfigModule.forFeature(
      registerAs(
        'guard',
        (): IConfigGuard => ({
          jwt: {
            accessSecret: process.env.JWT_ACCESS_SECRET,
            accessPublic: process.env.JWT_ACCESS_PUBLIC,
            accessExpire: process.env.JWT_ACCESS_EXPIRE,
            accessMaxAge: process.env.JWT_ACCESS_MAXAGE ? parseInt(process.env.JWT_ACCESS_EXPIRE) : 900000,
            refreshSecret: process.env.JWT_REFRESH_SECRET,
            refreshPublic: process.env.JWT_REFRESH_PUBLIC,
            refreshExpire: process.env.JWT_REFRESH_EXPIRE,
            refreshMaxAge: process.env.JWT_REFRESH_MAXAGE ? parseInt(process.env.JWT_ACCESS_EXPIRE) : 10800000,
          },
        }),
      ),
    ),
    JwtModule.register({}),
    PassportModule.register({ session: false }),
  ],
  exports: [JwtAccessStrategy, JwtRefreshStrategy, GuardService],
  providers: [JwtAccessStrategy, JwtRefreshStrategy, GuardService],
})
export class GuardModule {}
