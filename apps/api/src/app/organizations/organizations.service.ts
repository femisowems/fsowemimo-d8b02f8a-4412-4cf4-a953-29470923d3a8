
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/data/entities';

@Injectable()
export class OrganizationsService {
    constructor(
        @InjectRepository(Organization)
        private organizationsRepository: Repository<Organization>
    ) { }

    async update(id: string, updateData: Record<string, unknown>) {
        await this.organizationsRepository.update(id, updateData);
        return this.organizationsRepository.findOne({ where: { id } });
    }

    async findOne(id: string) {
        return this.organizationsRepository.findOne({ where: { id } });
    }
}
