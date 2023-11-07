import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { randomUUID } from 'crypto'
import type { JwtInfo } from './guard.interface'

@Injectable()
export class GuardService {
  constructor(
    private readonly config: ConfigService,
    private readonly service: JwtService,
  ) {}

  get maxAgeAccess(): number {
    return this.config.get('guard.jwt.accessMaxAge')
  }

  get maxAgeRefresh(): number {
    return this.config.get('guard.jwt.refreshMaxAge')
  }

  async signed(type: 'access' | 'refresh', info: JwtInfo, maxAge?: number): Promise<string> {
    return this.service.signAsync(info, {
      algorithm: 'RS256',
      expiresIn: maxAge ?? (type === 'access' ? this.maxAgeAccess : this.maxAgeRefresh),
      secret:
        type === 'access' ? this.config.get('guard.jwt.accessSecret') : this.config.get('guard.jwt.refreshSecret'),
      jwtid: randomUUID(),
    })
  }
}
