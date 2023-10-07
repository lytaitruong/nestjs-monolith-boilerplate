import { AppException } from '@/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { ExecutionContext, Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthGuard, PassportStrategy } from '@nestjs/passport'
import { Cache } from 'cache-manager'
import { Profile, Strategy, StrategyOptions } from 'passport-github2'
import { Observable } from 'rxjs'
import { GuardOauth2Context, GuardOauth2Session } from '../guard.decorator'
import { GUARD_ERROR } from '../guard.exception'
import { GuardProvider, IConfigGithubOauth2, Oauth2Info } from '../guard.interface'

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, GuardProvider.GITHUB) {
  constructor(
    config: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {
    super(config.get<IConfigGithubOauth2>('guard.github') as StrategyOptions)
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile, done: (err: Error, data?) => void) {
    if (!profile) done(new AppException(GUARD_ERROR.GITHUB_OAUTH_INVALID))

    const info: Oauth2Info = {
      name:
        profile.displayName ||
        (profile.name ? profile.name.givenName + ' ' + profile.name.familyName : profile.username),
      email: profile.emails?.[0].value,
      image: profile.photos?.[0].value,
      provider: GuardProvider.GITHUB,
      oauth2: {
        id: profile.id,
        accessToken,
        refreshToken,
      },
    }
    done(null, info)
  }

  @GuardOauth2Session(GuardProvider.GITHUB)
  authenticate(req, options?: StrategyOptions): void {
    return super.authenticate(req, options)
  }
}

@Injectable()
export class GithubOauth2Guard extends AuthGuard(GuardProvider.GITHUB) {
  constructor() {
    super({ accessType: 'offline', prompt: 'consent' })
  }

  @GuardOauth2Context()
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context)
  }
}
