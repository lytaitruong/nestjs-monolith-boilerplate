import { AppException } from '@/common'
import { JwtInfo } from '@/modules/guard'
import { PrismaService } from '@/modules/prisma'
import { S3Service } from '@/modules/s3'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { User } from '@prisma/client'
import * as dayjs from 'dayjs'
import { UserUpdateDto } from './user.dto'
import { USER_ERROR } from './user.exception'

@Injectable()
export class UserService {
  private readonly PHOTO_FOLDER = 'photos'
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  async getOne(info: JwtInfo): Promise<Partial<User>> {
    const user = await this.prisma.user.findUnique({
      where: { id: info.sub },
      select: { id: true, email: true, image: true, state: true, gender: true, createdAt: true },
    })
    user.image = this.s3.getSignURL('public', user.image, dayjs().endOf('day').toDate())

    return user
  }

  async update(info: JwtInfo, data: UserUpdateDto) {
    if (data.phone) {
      const phoneExist = await this.prisma.user.findUnique({ where: { phone: data.phone } })
      if (phoneExist) throw new AppException(USER_ERROR.PHONE_EXISTED)
    }
    const image = data.image
      ? await this.s3.upload({
          Bucket: this.s3.bucketPublic,
          Key: this.PHOTO_FOLDER + '/' + data.image.filename,
          Body: await data.image.toBuffer(),
          ContentType: data.image.mimetype,
        })
      : null
    const user = await this.prisma.user.update({
      where: { id: info.sub },
      data: {
        ...(image ? { image: new URL(image.Location).pathname } : {}),
        ...(data.phone ? { phone: data.phone } : {}),
      },
      select: { id: true, email: true, image: true, state: true, gender: true, createdAt: true },
    })
    user.image = this.s3.getSignURL('public', user.image, dayjs().endOf('day').toDate())
    return user
  }
}
