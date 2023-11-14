import { Module } from '@nestjs/common'
import { ConfigModule, registerAs } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { IConfigGuard } from './guard.interface'
import { GuardService } from './guard.service'
import { GithubStrategy } from './oauth/github.guard'
import { GoogleStrategy } from './oauth/google.guard'
import { JwtAccessStrategy } from './strategies/access.guard'
import { JwtRefreshStrategy } from './strategies/refresh.guard'

export const configGuard = (): IConfigGuard => ({
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessPublic: process.env.JWT_ACCESS_PUBLIC,
    accessMaxAge: process.env.JWT_ACCESS_MAXAGE ? parseInt(process.env.JWT_ACCESS_MAXAGE) : 900,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshPublic: process.env.JWT_REFRESH_PUBLIC,
    refreshMaxAge: process.env.JWT_REFRESH_MAXAGE ? parseInt(process.env.JWT_REFRESH_MAXAGE) : 2592000,
  },
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    scope: process.env.GOOGLE_SCOPE ? process.env.GOOGLE_SCOPE.split(',') : [],
  },
  github: {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
    scope: process.env.GITHUB_SCOPE ? process.env.GITHUB_SCOPE.split(',') : [],
  },
})

@Module({
  imports: [
    ConfigModule.forFeature(registerAs('guard', configGuard)),
    JwtModule.register({}),
    PassportModule.register({ session: false }),
  ],
  exports: [JwtAccessStrategy, JwtRefreshStrategy, GoogleStrategy, GithubStrategy, GuardService],
  providers: [JwtAccessStrategy, JwtRefreshStrategy, GoogleStrategy, GithubStrategy, GuardService],
})
export class GuardModule {}
