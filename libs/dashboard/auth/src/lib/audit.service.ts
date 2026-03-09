import { Injectable, Logger } from '@nestjs/common';
import { ActionType } from '@secure-task-management/dashboard-data/enums';

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
