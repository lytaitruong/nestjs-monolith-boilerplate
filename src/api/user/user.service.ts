import { JwtInfo } from '@/modules/guard'
import { PrismaService } from '@/modules/prisma'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { User } from '@prisma/client'

@Injectable()
export class UserService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async getProfile(info: JwtInfo): Promise<Partial<User>> {
    const user = await this.prisma.user.findUnique({
      where: { id: info.sub },
      select: { id: true, phone: true, gender: true, status: true, createdAt: true, updatedAt: true },
    })

    return user
  }
}
