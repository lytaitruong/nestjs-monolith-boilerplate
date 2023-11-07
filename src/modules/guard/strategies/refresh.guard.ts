import { AppException } from '@/common'
import { ExecutionContext, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthGuard, PassportStrategy } from '@nestjs/passport'
import { JsonWebTokenError, NotBeforeError, TokenExpiredError } from 'jsonwebtoken'
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt'
import type { Observable } from 'rxjs'
import { GUARD_ERROR } from '../guard.exception'
import { GuardCookie, GuardType, JwtInfo } from '../guard.interface'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, GuardType.REFRESH) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req.cookies[GuardCookie.REFRESH_TOKEN],
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get('guard.jwt.refreshPublic'),
      algorithms: ['RS256'],
    } as StrategyOptions)
  }
  async validate(payload: JwtInfo) {
    return payload
  }
}

@Injectable()
export class JwtRefreshGuard extends AuthGuard(GuardType.REFRESH) {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context)
  }
  // !Warning NotBeforeError alway highest priority
  handleRequest<TUser = JwtInfo>(err: Error, user: JwtInfo, info: any): TUser {
    if (info instanceof NotBeforeError) throw new AppException(GUARD_ERROR.REFRESH_TOKEN_CLAIMS_BEFORE)
    if (info instanceof TokenExpiredError) throw new AppException(GUARD_ERROR.REFRESH_TOKEN_EXPIRED)
    if (info instanceof JsonWebTokenError) throw new AppException(GUARD_ERROR.REFRESH_TOKEN_INVALID)
    if (err || !user || !user.sub) throw new AppException(GUARD_ERROR.REFRESH_TOKEN_REQUIRE)

    return user as TUser
  }
}
