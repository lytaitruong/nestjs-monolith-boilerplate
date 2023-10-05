import { IsSwaggerDate, IsSwaggerEnum, IsSwaggerString } from '@/common'
import { $Enums, User } from '@prisma/client'

export class UserProfileRes implements Partial<User> {
  @IsSwaggerString({ required: true })
  id: string

  @IsSwaggerString({ required: true })
  phone: string

  @IsSwaggerEnum($Enums.Role, { required: true })
  role: $Enums.Role

  @IsSwaggerEnum($Enums.Gender, { required: true })
  gender: $Enums.Gender

  @IsSwaggerEnum($Enums.Status, { required: true })
  status: $Enums.Status

  @IsSwaggerDate()
  createdAt: Date

  @IsSwaggerDate()
  updatedAt: Date
}
