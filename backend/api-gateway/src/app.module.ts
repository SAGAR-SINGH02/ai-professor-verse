import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Configuration
import { configuration } from './config/configuration';
import { validationSchema } from './config/validation';

// Guards and Interceptors
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { RateLimitGuard } from './common/guards/rate-limit.guard';
import { CacheInterceptor } from './common/interceptors/cache.interceptor';

// Modules
import { ProxyModule } from './proxy/proxy.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { WebSocketGatewayModule } from './websocket/websocket.module';

// Services
import { RedisService } from './common/services/redis.service';
import { LoggerService } from './common/services/logger.service';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get<number>('RATE_LIMIT_TTL', 60),
        limit: configService.get<number>('RATE_LIMIT_MAX', 100),
        storage: new (require('@nestjs/throttler').ThrottlerStorageRedisService)(
          configService.get('redis'),
        ),
      }),
    }),

    // JWT Configuration
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h'),
          issuer: configService.get<string>('JWT_ISSUER', 'ai-professor-verse'),
          audience: configService.get<string>('JWT_AUDIENCE', 'ai-professor-users'),
        },
      }),
    }),

    // Passport
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Feature Modules
    AuthModule,
    ProxyModule,
    HealthModule,
    MetricsModule,
    WebSocketGatewayModule,
  ],
  providers: [
    // Global Services
    RedisService,
    LoggerService,

    // Global Guards
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },

    // Global Interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {
  constructor(private readonly logger: LoggerService) {
    this.logger.log('🏗️ API Gateway Module initialized', 'AppModule');
  }
}
