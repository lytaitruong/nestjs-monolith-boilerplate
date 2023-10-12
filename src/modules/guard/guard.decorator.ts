import { ApiFailedRes, HEADERS, IReq, TTL } from '@/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Controller, ExecutionContext, Inject, UseGuards, applyDecorators, createParamDecorator } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { Cache } from 'cache-manager'
import { randomUUID } from 'crypto'
import { getClientIp } from 'request-ip'
import { UAParser } from 'ua-parser-js'
import { GUARD_ERROR } from './guard.exception'
import { GuardProvider, IReqOauth2 } from './guard.interface'
import { JwtAccessGuard } from './strategies/access.guard'
import { RoleGuard } from './strategies/role.guard'

export const Device = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const req: IReq = context.switchToHttp().getRequest()

  return new UAParser(req.headers[HEADERS.USER_AGENT]).getDevice()
})

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

export const GuardOauth2Session = (provider: GuardProvider) => {
  const inject = Inject(CACHE_MANAGER)

  return (target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) => {
    inject(target, CACHE_MANAGER) // equals constructor(@Inject(CACHE_MANAGER) cache: Cache)
    const originalMethod = descriptor.value

    descriptor.value = async function (req: IReqOauth2, options: any) {
      const cache: Cache = this.cache
      const ip = getClientIp(req)
      // Flow verify code and state
      if (req.query && req.query['state'] && req.query['code']) {
        const state = await cache.get(`OAUTH_${provider}_${ip}`)

        if (state === req.query['state']) req.state = true

        await cache.del(`OAUTH_${provider}_${ip}`)
      }
      // Flow request prompt oauth2
      else {
        options.state = randomUUID()
        cache.set(`OAUTH_${provider}_${ip}`, options.state, TTL.ONE_MINUTE * 1000)
      }
      return originalMethod.call(this, req, options)
    }
  }
}
