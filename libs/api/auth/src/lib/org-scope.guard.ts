
import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject } from '@nestjs/common';
import { OrgScopeService } from './org-scope.service';

@Injectable()
export class OrganizationScopeGuard implements CanActivate {
    constructor(
        @Inject(OrgScopeService)
        private readonly orgScopeService: OrgScopeService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Check various sources for organizationId
        const orgId = request.params?.orgId || request.body?.organizationId || request.query?.orgId;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        if (!orgId) {
            // If no explicit orgId is provided in the request, we allow it 
            // (service-level filters will still apply)
            return true;
        }

        const accessibleOrgs = await this.orgScopeService.getAccessibleOrganizationIds(user);
        if (!accessibleOrgs.includes(orgId)) {
            throw new ForbiddenException('You do not have access to this organization');
        }

        return true;
    }
}
