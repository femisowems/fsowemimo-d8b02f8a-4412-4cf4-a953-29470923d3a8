import { Controller, Put, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Put(':id')
    @UseGuards(AuthGuard('supabase-jwt'))
    async updateUser(@Req() req: any, @Body() updateData: any) {
        // Ensure user can only update their own profile or is admin (omitted for brevity)
        return this.usersService.updateUser(req.params.id, updateData);
    }

    @Patch('preferences')
    @UseGuards(AuthGuard('supabase-jwt'))
    async updatePreferences(@Req() req: any, @Body() preferences: any) {
        return this.usersService.updateUser(req.user.id, { preferences });
    }
}
