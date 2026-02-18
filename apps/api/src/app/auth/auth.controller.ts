
import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor() { }

    @Get('me')
    @UseGuards(AuthGuard('supabase-jwt'))
    async getMe(@Req() req: any) {
        return req.user;
    }
}
