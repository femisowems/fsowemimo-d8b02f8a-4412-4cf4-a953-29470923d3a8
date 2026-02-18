
import { Controller, Get, Post, Body, Req, UseGuards, Inject } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Assume this will be created or standard
import { RolesGuard } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/auth/roles.guard';
import { Roles } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/auth/roles.decorator'; // Need this too
import { UserRole, ActionType } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/data/enums';
// Re-using existent guards from previous steps or creating new ones if needed.
// Requirement says "JwtAuthGuard - protect ALL task and audit endpoints"

@Controller('audit-log')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
    constructor(@Inject(AuditService) private auditService: AuditService) { }

    @Get()
    @Roles(UserRole.OWNER, UserRole.ADMIN)
    async findAll() {
        // Basic implementation to return logs
        // Assuming auditService has findAll method, or we use repo directly if service was minimal
        // The service I created in step 151 only has logAction. I should add findAll to service first or just use repo here?
        // Better to update service.
        return this.auditService.findAll();
    }

    @Post()
    async create(@Req() req: any, @Body() body: { action: string, resourceType?: string, resourceId?: string }) {
        let action: ActionType = ActionType.UPDATE; // Default

        // Prioritize incoming resourceType if it's not 'UNKNOWN'
        let resourceType = body.resourceType && body.resourceType !== 'UNKNOWN' ? body.resourceType : 'UNKNOWN';

        const actionUpper = body.action.toUpperCase();
        if (Object.values(ActionType).includes(body.action as ActionType)) {
            action = body.action as ActionType;
        } else if (actionUpper.includes('UPDATE')) {
            action = ActionType.UPDATE;
        } else if (actionUpper.includes('CREATE')) {
            action = ActionType.CREATE;
        } else if (actionUpper.includes('DELETE')) {
            action = ActionType.DELETE;
        } else if (actionUpper.includes('READ')) {
            action = ActionType.READ;
        }

        // Improved fallback detection if still UNKNOWN
        if (resourceType === 'UNKNOWN') {
            if (body.action.match(/Profile|Security|Preferences|User/i)) {
                resourceType = 'User';
            } else if (body.action.match(/Task/i)) {
                resourceType = 'Task';
            } else if (body.action.match(/Organization|Org/i)) {
                resourceType = 'Organization';
            }
        }

        // Normalize labels for UI consistency (Title Case)
        if (resourceType === 'USER') resourceType = 'User';
        if (resourceType === 'TASK') resourceType = 'Task';
        if (resourceType === 'ORGANIZATION') resourceType = 'Organization';

        return this.auditService.logAction(req.user.id, action, resourceType, body.resourceId);
    }
}
