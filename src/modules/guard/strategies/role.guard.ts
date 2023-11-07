import { AppException, IReq } from '@/common'
import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Observable } from 'rxjs'
import { GUARD_ERROR } from '../guard.exception'
import { GuardType, JwtInfo } from '../guard.interface'

export const Roles = (...roles: string[]) => SetMetadata(GuardType.ROLE, roles)

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.getAllAndOverride<string[]>(GuardType.ROLE, [context.getHandler(), context.getClass()])
    if (!roles) return true

    const req: IReq<JwtInfo> = context.switchToHttp().getRequest()

    if (req.user && roles.includes(req.user.role)) return true

    throw new AppException(GUARD_ERROR.FORBIDDEN_RESOURCE)
  }
}
