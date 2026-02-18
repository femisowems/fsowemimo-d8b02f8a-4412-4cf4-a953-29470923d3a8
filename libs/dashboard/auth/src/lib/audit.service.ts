
import { Injectable, Logger } from '@nestjs/common';
import { ActionType } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/dashboard-data/enums';

@Injectable()
export class AuditLogService {
    private readonly logger = new Logger(AuditLogService.name);

    logAction(userId: string, action: ActionType, resourceId?: string) {
        this.logger.log({
            timestamp: new Date().toISOString(),
            userId,
            action,
            resourceId,
        });
    }
}
