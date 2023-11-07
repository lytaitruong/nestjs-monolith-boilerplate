import { AppException } from '@/common'
import { ExecutionContext, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthGuard, PassportStrategy } from '@nestjs/passport'
import { JsonWebTokenError, NotBeforeError, TokenExpiredError } from 'jsonwebtoken'
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt'
import type { Observable } from 'rxjs'
import { GUARD_ERROR } from '../guard.exception'
import { GuardCookie, GuardType, JwtInfo } from '../guard.interface'

/**
 *! Not using Redis to make a blacklist token, why -> The number of invalid tokens increases over time
 */
@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, GuardType.ACCESS) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req.cookies[GuardCookie.ACCESS_TOKEN],
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get('guard.jwt.accessPublic'),
      algorithms: ['RS256'],
    } as StrategyOptions)
  }
  async validate(payload: JwtInfo) {
    return payload
  }
}

@Injectable()
export class JwtAccessGuard extends AuthGuard(GuardType.ACCESS) {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context)
  }
  // !Warning NotBeforeError alway highest priority
  handleRequest<TUser = JwtInfo>(err: Error, user: JwtInfo, info: any): TUser {
    if (info instanceof NotBeforeError) throw new AppException(GUARD_ERROR.ACCESS_TOKEN_CLAIMS_BEFORE)
    if (info instanceof TokenExpiredError) throw new AppException(GUARD_ERROR.ACCESS_TOKEN_EXPIRED)
    if (info instanceof JsonWebTokenError) throw new AppException(GUARD_ERROR.ACCESS_TOKEN_INVALID)
    if (err || !user || !user.sub) throw new AppException(GUARD_ERROR.ACCESS_TOKEN_REQUIRE)

    return user as TUser
  }
}
