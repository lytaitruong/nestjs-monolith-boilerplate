import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { JwtInfo } from './guard.interface'

@Injectable()
export class GuardService {
  constructor(
    private readonly config: ConfigService,
    private readonly service: JwtService,
  ) {}

  async signed(type: 'access' | 'refresh', info: JwtInfo): Promise<string> {
    return this.service.signAsync(info, {
      algorithm: 'RS256',
      expiresIn:
        type === 'access' ? this.config.get('guard.jwt.accessExpire') : this.config.get('guard.jwt.refreshExpire'),
      secret:
        type === 'access' ? this.config.get('guard.jwt.accessSecret') : this.config.get('guard.jwt.refreshSecret'),
    })
  }
}
