import { AppException } from '@/common'
import { JwtInfo } from '@/modules/guard'
import { PrismaService } from '@/modules/prisma'
import { S3Service } from '@/modules/s3'
import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { Queue } from 'bullmq'
import * as dayjs from 'dayjs'
import { UserUpdateDto } from './user.dto'
import { USER_ERROR } from './user.exception'
import { IUserImageUploadData, USER_IMAGE, USER_IMAGE_PROCESSOR } from './user.interface'

@Injectable()
export class UserService {
  private readonly PHOTO_FOLDER = 'photos'
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
    @InjectQueue(USER_IMAGE_PROCESSOR) private readonly queue: Queue<IUserImageUploadData>,
  ) {}

  async getOne(info: JwtInfo): Promise<Partial<User>> {
    const user = await this.prisma.user.findUnique({
      where: { id: info.sub },
      select: { id: true, email: true, image: true, state: true, gender: true, createdAt: true },
    })
    // !Important of time expired, it will burn your cash -> Cache Useless if time expired difference
    user.image = this.s3.getSignURL('public', user.image, dayjs().endOf('day').toDate())

    return user
  }

  async update(info: JwtInfo, data: UserUpdateDto) {
    if (data.phone) {
      const phoneExist = await this.prisma.user.findUnique({ where: { phone: data.phone } })
      if (phoneExist) throw new AppException(USER_ERROR.PHONE_EXISTED)
    }
    if (data.image) {
      await this.queue.add(USER_IMAGE.UPLOAD, {
        name: this.PHOTO_FOLDER + '/' + data.image.filename,
        type: data.image.mimetype,
        data: await data.image.toBuffer(),
      })
    }

    const user = await this.prisma.user.update({
      where: { id: info.sub },
      data: {
        ...(data.image ? { image: encodeURI(data.image.filename) } : {}),
        ...(data.phone ? { phone: data.phone } : {}),
      },
      select: { id: true, email: true, image: true, state: true, gender: true, createdAt: true },
    })
    // My cloudfront has set prefix with Photo so we don't need add it right here
    user.image = this.s3.getSignURL('public', user.image, dayjs().endOf('day').toDate())
    return user
  }
}
