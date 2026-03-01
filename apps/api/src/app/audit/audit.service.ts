import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/data/entities';
import { ActionType } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/data/enums';
import { OnEvent } from '@nestjs/event-emitter';

export class AuditLogEvent {
    userId!: string;
    action!: ActionType;
    resourceType!: string;
    resourceId?: string;
}

@Injectable()
export class AuditService {
    constructor(
        @InjectRepository(AuditLog)
        private auditRepo: Repository<AuditLog>
    ) { }

    @OnEvent('audit.log', { async: true })
    async handleAuditLogEvent(payload: AuditLogEvent) {
        const { userId, action, resourceType, resourceId } = payload;
        const log = this.auditRepo.create({
            userId,
            action,
            resourceType,
            resourceId,
        });
        console.log(`[AUDIT EVENT RECEIVED] User ${userId} performed ${action} on ${resourceType}:${resourceId}`);
        return this.auditRepo.save(log);
    }

    async findAll() {
        return this.auditRepo.find({ order: { timestamp: 'DESC' } });
    }
}
