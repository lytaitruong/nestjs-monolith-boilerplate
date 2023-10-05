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
  avatar: string | null

  @IsSwaggerEnum($Enums.Role, { required: true })
  role: $Enums.Role

  @IsSwaggerEnum($Enums.Gender, { required: false, nullable: true })
  gender: $Enums.Gender | null

  @IsSwaggerEnum($Enums.Status, { required: false, nullable: true })
  status: $Enums.Status | null

  @IsSwaggerDate()
  createdAt: Date
}
