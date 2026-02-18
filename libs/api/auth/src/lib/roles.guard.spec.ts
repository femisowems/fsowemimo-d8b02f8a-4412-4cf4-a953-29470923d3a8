
import { RolesGuard } from './roles.guard';
import { RbacService } from './rbac.service';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { UserRole } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/data/enums';
import { createMock } from '@golevelup/ts-jest';

describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: Reflector;
    let rbacService: RbacService;

    beforeEach(() => {
        reflector = createMock<Reflector>();
        rbacService = createMock<RbacService>();
        guard = new RolesGuard(reflector, rbacService);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    it('should return true if no roles are required', () => {
        jest.spyOn(reflector, 'get').mockReturnValue(null);
        const context = createMock<ExecutionContext>();
        expect(guard.canActivate(context)).toBe(true);
    });

    it('should return true if user has the required role', () => {
        jest.spyOn(reflector, 'get').mockReturnValue([UserRole.ADMIN]);
        const context = createMock<ExecutionContext>();
        context.switchToHttp().getRequest.mockReturnValue({
            user: { role: UserRole.ADMIN },
        });
        jest.spyOn(rbacService, 'hasRequiredRole').mockReturnValue(true);

        expect(guard.canActivate(context)).toBe(true);
        expect(rbacService.hasRequiredRole).toHaveBeenCalledWith(UserRole.ADMIN, [UserRole.ADMIN]);
    });

    it('should return false if user does not have the required role', () => {
        jest.spyOn(reflector, 'get').mockReturnValue([UserRole.ADMIN]);
        const context = createMock<ExecutionContext>();
        context.switchToHttp().getRequest.mockReturnValue({
            user: { role: UserRole.VIEWER },
        });
        jest.spyOn(rbacService, 'hasRequiredRole').mockReturnValue(false);

        expect(guard.canActivate(context)).toBe(false);
    });
});
