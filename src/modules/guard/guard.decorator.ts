import { ApiFailedRes } from '@/common'
import { Controller, UseGuards, applyDecorators } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { GUARD_ERROR } from './guard.exception'
import { JwtAccessGuard } from './strategies/access.guard'

export const IsAuthController = (name: string, tags: string, auth = true) => {
  return applyDecorators(
    Controller(name),
    ApiTags(tags),
    ...(auth ? [UseGuards(JwtAccessGuard), ApiFailedRes(GUARD_ERROR.ACCESS_TOKEN_REQUIRE), ApiBearerAuth()] : []),
  )
}
