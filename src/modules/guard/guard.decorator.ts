import { ApiFailedRes } from '@/common'
import { Controller, UseGuards, applyDecorators } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { GUARD_ERROR } from './guard.exception'
import { JwtAccessGuard } from './strategies/access.guard'
import { RoleGuard } from './strategies/role.guard'

export const IsAuthController = (name: string, tags: string, auth = true) => {
  return applyDecorators(
    Controller(name),
    ApiTags(tags),
    // ! The order of guard is important, which will be execute first
    ...(auth
      ? [
          ApiBearerAuth(),
          UseGuards(JwtAccessGuard, RoleGuard),
          ApiFailedRes(
            GUARD_ERROR.ACCESS_TOKEN_REQUIRE,
            GUARD_ERROR.ACCESS_TOKEN_INVALID,
            GUARD_ERROR.ACCESS_TOKEN_EXPIRED,
            GUARD_ERROR.ACCESS_TOKEN_CLAIMS_BEFORE,
          ),
          ApiFailedRes(GUARD_ERROR.FORBIDDEN_RESOURCE),
        ]
      : []),
  )
}
