import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('AuthService');
  
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 3001);
    const environment = configService.get<string>('NODE_ENV', 'development');

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }));

    // Global prefix
    app.setGlobalPrefix('api/v1');

    // Swagger documentation
    if (environment !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('AI Professor Verse - Auth Service')
        .setDescription('Authentication and authorization service API')
        .setVersion('1.0')
        .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
          },
          'JWT-auth',
        )
        .addTag('Authentication', 'User authentication endpoints')
        .addTag('Authorization', 'Role and permission management')
        .addTag('OAuth', 'OAuth 2.0 integration')
        .addTag('MFA', 'Multi-factor authentication')
        .addTag('Users', 'User management')
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document);

      logger.log(`📚 Swagger docs available at http://localhost:${port}/api/docs`);
    }

    // Health check
    app.getHttpAdapter().get('/health', (req, res) => {
      res.json({
        service: 'auth-service',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment,
        version: process.env.npm_package_version || '1.0.0',
      });
    });

    await app.listen(port, '0.0.0.0');

    logger.log(`🔐 Auth Service is running on: http://localhost:${port}`);
    logger.log(`🌍 Environment: ${environment}`);
    
  } catch (error) {
    logger.error('❌ Failed to start Auth Service', error);
    process.exit(1);
  }
}

bootstrap();
