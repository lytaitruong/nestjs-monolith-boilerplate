import { IsSwaggerDate, IsSwaggerEnum, IsSwaggerString } from '@/common'
import { $Enums, User } from '@prisma/client'

export class UserProfileRes implements Partial<User> {
  @IsSwaggerString({ required: true })
  id: string

  @IsSwaggerString({ required: false, nullable: true })
  phone: string | null

  @IsSwaggerString({ required: false, nullable: true })
  email: string | null

  @IsSwaggerString({ required: false, nullable: true })
  image: string | null

  @IsSwaggerEnum($Enums.Gender, { required: false, nullable: true })
  gender: $Enums.Gender | null

  @IsSwaggerDate()
  createdAt: Date
}
