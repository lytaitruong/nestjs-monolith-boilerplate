import { AppException } from '@/common'
import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { GUARD_ERROR } from '../guard.exception'
import { GuardType, IReqJwt } from '../guard.interface'

export const Roles = (...roles: string[]) => SetMetadata(GuardType.ROLE, roles)

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.getAllAndOverride<string[]>(GuardType.ROLE, [context.getHandler(), context.getClass()])
    if (!roles || roles.length === 0) return true

    const req: IReqJwt = context.switchToHttp().getRequest()

    if (roles.includes(req.user.role)) return true

    throw new AppException(GUARD_ERROR.FORBIDDEN_RESOURCE)
  }
}
