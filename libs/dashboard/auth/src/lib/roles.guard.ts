/* eslint-disable @angular-eslint/prefer-inject */
import { Injectable, Inject } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/dashboard-data/enums';
import { RbacService } from './rbac.service';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        @Inject(Reflector) private reflector: Reflector,
        @Inject(RbacService) private rbacService: RbacService
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.get<UserRole[]>('roles', context.getHandler());
        if (!requiredRoles) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Use the helper from RbacService for inheritance support
        return this.rbacService.hasRequiredRole(user.role, requiredRoles);
    }
}
