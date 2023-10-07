import { AppException } from '@/common'
import { ExecutionContext, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthGuard, PassportStrategy } from '@nestjs/passport'
import { AuthenticateOptionsGoogle, Profile, Strategy, StrategyOptions, VerifyCallback } from 'passport-google-oauth20'
import { Observable } from 'rxjs'
import { GuardOauth2Context } from '../guard.decorator'
import { GUARD_ERROR } from '../guard.exception'
import { GuardProvider, IConfigGoogleOauth2, Oauth2Info } from '../guard.interface'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, GuardProvider.GOOGLE) {
  constructor(config: ConfigService) {
    super(config.get<IConfigGoogleOauth2>('guard.google') as StrategyOptions)
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) {
    if (!profile) done(new AppException(GUARD_ERROR.GOOGLE_OAUTH_INVALID))

    const info: Oauth2Info = {
      name:
        profile.displayName ||
        (profile.name ? profile.name.givenName + ' ' + profile.name.familyName : profile.username),
      email: profile.emails.filter((email) => email.verified)?.[0].value,
      image: profile.photos?.[0].value,
      provider: GuardProvider.GOOGLE,
      oauth2: {
        id: profile.id,
        accessToken,
        refreshToken,
      },
    }
    done(null, info)
  }
}

@Injectable()
export class GoogleOauth2Guard extends AuthGuard(GuardProvider.GOOGLE) {
  constructor() {
    super({ accessType: 'offline', prompt: 'consent' } as AuthenticateOptionsGoogle)
  }

  @GuardOauth2Context()
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context)
  }
}
