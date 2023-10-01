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

  async signed(info: JwtInfo): Promise<string> {
    return this.service.signAsync(info, {
      algorithm: 'RS256',
      expiresIn: this.config.get('guard.jwt.accessExpire'),
      secret: this.config.get('guard.jwt.accessSecret'),
    })
  }
}
