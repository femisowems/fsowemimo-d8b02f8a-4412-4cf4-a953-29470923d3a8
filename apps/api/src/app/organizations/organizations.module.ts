
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { Organization } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/data/entities';

@Module({
    imports: [TypeOrmModule.forFeature([Organization])],
    providers: [OrganizationsService],
    controllers: [OrganizationsController],
    exports: [OrganizationsService],
})
export class OrganizationsModule { }
