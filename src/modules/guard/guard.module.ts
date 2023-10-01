import { TTL } from '@/common'
import { Module } from '@nestjs/common'
import { ConfigModule, registerAs } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { IConfigGuard } from './guard.interface'
import { GuardService } from './guard.service'
import { JwtAccessStrategy } from './strategies/access.guard'

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
            accessMaxAge: process.env.JWT_ACCESS_MAXAGE ? parseInt(process.env.JWT_ACCESS_EXPIRE) : TTL.ONE_HOUR,
          },
        }),
      ),
    ),
    JwtModule.register({}),
    PassportModule.register({ session: false }),
  ],
  exports: [JwtAccessStrategy, GuardService],
  providers: [JwtAccessStrategy, GuardService],
})
export class GuardModule {}
