import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '@secure-task-management/data/entities';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private organizationsRepository: Repository<Organization>,
  ) {}

  async update(id: string, updateData: any) {
    await this.organizationsRepository.update(id, updateData);
    return this.organizationsRepository.findOne({ where: { id } });
  }

  async findOne(id: string) {
    return this.organizationsRepository.findOne({ where: { id } });
  }
}
