import { IsSwaggerDate, IsSwaggerEnum, IsSwaggerString } from '@/common'
import { Gender, User } from '@prisma/client'

export class UserProfileRes implements Partial<User> {
  @IsSwaggerString()
  id: string

  @IsSwaggerString({ required: false, nullable: true })
  phone: string | null

  @IsSwaggerString({ required: false, nullable: true })
  email: string | null

  @IsSwaggerString({ required: false, nullable: true })
  image: string | null

  @IsSwaggerEnum(Gender, { required: false, nullable: true })
  gender: Gender | null

  @IsSwaggerDate()
  createdAt: Date
}
