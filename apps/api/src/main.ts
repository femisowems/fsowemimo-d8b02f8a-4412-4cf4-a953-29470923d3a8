import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';

import helmet from 'helmet';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');

    // Security Middleware
    app.use(helmet());

    // Global Validation
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));

    // Dynamic CORS configuration
    const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'http://localhost:4200',
        'https://secure-task-manage-app-angular-dash.vercel.app',
        'https://secure-task-manage-app.vercel.app',
        'https://manage-app-angular.ssowemimo.com',
        'https://secure-task-manage-backend-api-production.up.railway.app',
    ];

    if (process.env.CORS_ORIGIN) {
        allowedOrigins.push(...process.env.CORS_ORIGIN.split(',').map(o => o.trim()));
    }

    app.enableCors({
        origin: (origin, callback) => {
            if (!origin) {
                callback(null, true);
                return;
            }

            const isAllowed = allowedOrigins.includes(origin) ||
                /\.vercel\.app$/.test(origin) ||
                /\.railway\.app$/.test(origin) ||
                /\.ssowemimo\.com$/.test(origin);

            if (isAllowed) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });

    const port = process.env.PORT || 3001;
    await app.listen(port);

    console.log(`\n🚀 Application is running on: http://localhost:${port}/api`);
    console.log('\n🔑 TEST CREDENTIALS:');
    console.log('-----------------------------------');
    console.log('Admin (Owner): admin@test.com / password123');
    console.log('User (Viewer): user@test.com  / password123');
    console.log('-----------------------------------\n');
}
bootstrap();
