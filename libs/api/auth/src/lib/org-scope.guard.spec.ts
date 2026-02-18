
import { OrganizationScopeGuard } from './org-scope.guard';
import { OrgScopeService } from './org-scope.service';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';

describe('OrganizationScopeGuard', () => {
    let guard: OrganizationScopeGuard;
    let orgScopeService: OrgScopeService;

    beforeEach(() => {
        orgScopeService = createMock<OrgScopeService>();
        guard = new OrganizationScopeGuard(orgScopeService);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    it('should throw ForbiddenException if user is not present', async () => {
        const context = createMock<ExecutionContext>();
        context.switchToHttp().getRequest.mockReturnValue({});

        await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('should return true if no orgId is found in request', async () => {
        const context = createMock<ExecutionContext>();
        context.switchToHttp().getRequest.mockReturnValue({
            user: { id: 'user-1' },
            params: {},
            body: {},
            query: {},
        });

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
    });

    it('should return true if orgId is in accessible organizations', async () => {
        const context = createMock<ExecutionContext>();
        context.switchToHttp().getRequest.mockReturnValue({
            user: { id: 'user-1' },
            params: { orgId: 'org-1' },
        });
        jest.spyOn(orgScopeService, 'getAccessibleOrganizationIds').mockResolvedValue(['org-1', 'org-2']);

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
    });

    it('should throw ForbiddenException if orgId is not in accessible organizations', async () => {
        const context = createMock<ExecutionContext>();
        context.switchToHttp().getRequest.mockReturnValue({
            user: { id: 'user-1' },
            body: { organizationId: 'org-3' },
        });
        jest.spyOn(orgScopeService, 'getAccessibleOrganizationIds').mockResolvedValue(['org-1', 'org-2']);

        await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('should check orgId from query params', async () => {
        const context = createMock<ExecutionContext>();
        context.switchToHttp().getRequest.mockReturnValue({
            user: { id: 'user-1' },
            query: { orgId: 'org-1' },
            params: {},
            body: {},
        });
        jest.spyOn(orgScopeService, 'getAccessibleOrganizationIds').mockResolvedValue(['org-1']);

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
    });
});
