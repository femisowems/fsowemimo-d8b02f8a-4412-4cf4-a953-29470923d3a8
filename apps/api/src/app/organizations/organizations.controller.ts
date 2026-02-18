
import { Controller, Put, Get, Body, Param, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('organizations')
export class OrganizationsController {
    constructor(private organizationsService: OrganizationsService) { }

    @Put(':id')
    @UseGuards(AuthGuard('supabase-jwt'))
    async update(@Param('id') id: string, @Body() updateData: any) {
        return this.organizationsService.update(id, updateData);
    }

    @Get(':id')
    @UseGuards(AuthGuard('supabase-jwt'))
    async findOne(@Param('id') id: string) {
        return this.organizationsService.findOne(id);
    }
}
