import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Admin } from 'src/decorators/admin.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const onlyForAdmin = this.reflector.get(Admin, context.getHandler());
    if (!onlyForAdmin) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return user.isAdmin;
  }
}
