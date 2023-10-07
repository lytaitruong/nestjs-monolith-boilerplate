import { ApiFailedRes } from '@/common'
import { Controller, ExecutionContext, UseGuards, applyDecorators } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { GUARD_ERROR } from './guard.exception'
import { JwtAccessGuard } from './strategies/access.guard'
import { RoleGuard } from './strategies/role.guard'

// ! The order of guard is important, which will be execute first
export const GuardController = (name: string, tags = name) => {
  return applyDecorators(
    Controller(name),
    ApiTags(tags),
    ApiBearerAuth(),
    UseGuards(JwtAccessGuard, RoleGuard),
    ApiFailedRes(
      GUARD_ERROR.ACCESS_TOKEN_REQUIRE,
      GUARD_ERROR.ACCESS_TOKEN_INVALID,
      GUARD_ERROR.ACCESS_TOKEN_EXPIRED,
      GUARD_ERROR.ACCESS_TOKEN_CLAIMS_BEFORE,
    ),
    ApiFailedRes(GUARD_ERROR.FORBIDDEN_RESOURCE),
  )
}

/**
 * !Fastify don't have this function so you need implement by your hand
 */
export const GuardOauth2Context = () => {
  return (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value
    descriptor.value = function (context: ExecutionContext) {
      const req = context.switchToHttp().getRequest()
      const res = context.switchToHttp().getResponse()

      res.setHeader = function (key, value) {
        return this.raw.setHeader(key, value)
      }
      res.end = function () {
        this.raw.end()
      }
      req.res = res

      return originalMethod.call(this, context)
    }
  }
}
