
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    @Get()
    getHello() {
        return { status: 'Secure Task Management App API is running', version: '1.0.0' };
    }
}
