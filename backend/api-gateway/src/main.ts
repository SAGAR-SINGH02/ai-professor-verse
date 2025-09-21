import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import * as helmet from 'helmet';
import * as cors from 'cors';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 3000);
    const environment = configService.get<string>('NODE_ENV', 'development');

    // Security middleware
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "wss:", "ws:"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }));

    // CORS configuration
    app.use(cors({
      origin: configService.get<string>('FRONTEND_URL', 'http://localhost:8080'),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Compression
    app.use(compression());

    // Global prefix
    app.setGlobalPrefix('api/v1');

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }));

    // Global filters and interceptors
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(
      new LoggingInterceptor(),
      new TransformInterceptor(),
    );

    // Swagger documentation
    if (environment !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('AI Professor Verse API')
        .setDescription('Comprehensive API for AI-powered 3D EdTech platform')
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
        .addTag('Authentication', 'User authentication and authorization')
        .addTag('Users', 'User management and profiles')
        .addTag('AI', 'AI tutoring and emotion detection')
        .addTag('Real-time', 'WebSocket and real-time communication')
        .addTag('Content', 'Course and content management')
        .addTag('Analytics', 'Learning analytics and progress tracking')
        .addTag('Code Execution', 'Secure code execution and analysis')
        .addServer(`http://localhost:${port}`, 'Development server')
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
          persistAuthorization: true,
          tagsSorter: 'alpha',
          operationsSorter: 'alpha',
        },
      });

      logger.log(`📚 Swagger documentation available at http://localhost:${port}/api/docs`);
    }

    // Health check endpoint
    app.getHttpAdapter().get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment,
        version: process.env.npm_package_version || '1.0.0',
      });
    });

    await app.listen(port, '0.0.0.0');

    logger.log(`🚀 API Gateway is running on: http://localhost:${port}`);
    logger.log(`🌍 Environment: ${environment}`);
    logger.log(`📊 Health check: http://localhost:${port}/health`);
    
  } catch (error) {
    logger.error('❌ Failed to start API Gateway', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  const logger = new Logger('UncaughtException');
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  const logger = new Logger('UnhandledRejection');
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

bootstrap();
