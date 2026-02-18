
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/data/entities';
import { ActionType } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/data/enums';

@Injectable()
export class AuditService {
    constructor(
        @InjectRepository(AuditLog)
        private auditRepo: Repository<AuditLog>
    ) { }

    async logAction(userId: string, action: ActionType, resourceType: string, resourceId?: string) {
        const log = this.auditRepo.create({
            userId,
            action,
            resourceType,
            resourceId,
        });
        console.log(`[AUDIT] User ${userId} performed ${action} on ${resourceType}:${resourceId}`);
        return this.auditRepo.save(log);
    }

    async findAll() {
        return this.auditRepo.find({ order: { timestamp: 'DESC' } });
    }
}
