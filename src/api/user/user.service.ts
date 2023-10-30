import { AppException } from '@/common'
import { JwtInfo } from '@/modules/guard'
import { PrismaService } from '@/modules/prisma'
import { S3Service } from '@/modules/s3'
import { StripeService } from '@/modules/stripe'
import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { Queue } from 'bullmq'
import * as dayjs from 'dayjs'
import { UserUpdateDto } from './user.dto'
import { USER_ERROR } from './user.exception'
import { IUserImageConverterData, USER_IMAGE_PROCESSOR, UserImageJob } from './user.interface'

@Injectable()
export class UserService {
  private readonly PHOTO_FOLDER = 'photos'
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
    private readonly s3: S3Service,
    @InjectQueue(USER_IMAGE_PROCESSOR) private readonly queue: Queue<IUserImageConverterData, string, UserImageJob>,
  ) {}

  async getOne(info: JwtInfo): Promise<Partial<User>> {
    const user = await this.prisma.user.findUnique({
      where: { id: info.sub },
      select: { id: true, email: true, image: true, state: true, gender: true, createdAt: true },
    })
    // !Important of time expired, it will burn your cash -> Cache Useless if time expired difference
    user.image = this.s3.getSignURL('bucketPublic', user.image, dayjs().endOf('day').toDate())

    return user
  }

  async update(info: JwtInfo, data: UserUpdateDto, image = `${info.sub}_avatar.webp`) {
    if (data.phone) {
      const phoneExist = await this.prisma.user.findUnique({ where: { phone: data.phone } })
      if (phoneExist) throw new AppException(USER_ERROR.PHONE_EXISTED)
    }
    if (data.image) {
      await this.queue.add('user-image-converter', {
        type: data.image.mimetype,
        data: await data.image.toBuffer(),
        name: this.PHOTO_FOLDER + '/' + image,
      })
    }

    const user = await this.prisma.user.update({
      where: { id: info.sub },
      data: {
        ...(data.phone ? { phone: data.phone } : {}),
        ...(data.image ? { image } : {}),
      },
      select: { id: true, email: true, image: true, state: true, gender: true, createdAt: true },
    })
    // My cloudfront has set prefix with Photo so we don't need add it right
    user.image = this.s3.getSignURL('bucketPublic', user.image, dayjs().endOf('day').toDate())
    return user
  }
}
