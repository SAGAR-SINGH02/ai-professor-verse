import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export const createDatabaseConfig = (configService: ConfigService): DataSourceOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';
  
  return {
    type: 'postgres',
    host: configService.get<string>('POSTGRES_HOST', 'localhost'),
    port: configService.get<number>('POSTGRES_PORT', 5432),
    username: configService.get<string>('POSTGRES_USER', 'postgres'),
    password: configService.get<string>('POSTGRES_PASSWORD'),
    database: configService.get<string>('POSTGRES_DB', 'ai_professor_db'),
    ssl: configService.get<boolean>('POSTGRES_SSL', false) ? { rejectUnauthorized: false } : false,
    synchronize: !isProduction, // Only sync in development
    logging: !isProduction,
    entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    subscribers: [__dirname + '/../subscribers/*{.ts,.js}'],
    extra: {
      max: configService.get<number>('POSTGRES_POOL_SIZE', 20),
      connectionTimeoutMillis: 30000,
      idleTimeoutMillis: 30000,
    },
  };
};

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB || 'ai_professor_db',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
  entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  subscribers: [__dirname + '/../subscribers/*{.ts,.js}'],
});

// Redis configuration
export const createRedisConfig = (configService: ConfigService) => ({
  host: configService.get<string>('REDIS_HOST', 'localhost'),
  port: configService.get<number>('REDIS_PORT', 6379),
  password: configService.get<string>('REDIS_PASSWORD'),
  db: configService.get<number>('REDIS_DB', 0),
  keyPrefix: configService.get<string>('REDIS_KEY_PREFIX', 'ai-professor:'),
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
});

// MongoDB configuration
export const createMongoConfig = (configService: ConfigService) => ({
  uri: configService.get<string>('MONGODB_URI', 'mongodb://localhost:27017/content_db'),
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: configService.get<number>('MONGODB_MAX_POOL_SIZE', 10),
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

// Neo4j configuration
export const createNeo4jConfig = (configService: ConfigService) => ({
  uri: configService.get<string>('NEO4J_URI', 'bolt://localhost:7687'),
  username: configService.get<string>('NEO4J_USER', 'neo4j'),
  password: configService.get<string>('NEO4J_PASSWORD'),
  database: configService.get<string>('NEO4J_DATABASE', 'neo4j'),
});

// Kafka configuration
export const createKafkaConfig = (configService: ConfigService) => ({
  clientId: configService.get<string>('KAFKA_CLIENT_ID', 'ai-professor-backend'),
  brokers: configService.get<string>('KAFKA_BROKERS', 'localhost:9092').split(','),
  groupId: configService.get<string>('KAFKA_GROUP_ID', 'ai-professor-group'),
  retry: {
    initialRetryTime: 100,
    retries: 8,
  },
});

// RabbitMQ configuration
export const createRabbitMQConfig = (configService: ConfigService) => ({
  url: configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672'),
  exchange: configService.get<string>('RABBITMQ_EXCHANGE', 'ai-professor-exchange'),
  queuePrefix: configService.get<string>('RABBITMQ_QUEUE_PREFIX', 'ai-professor'),
  connectionInitOptions: {
    wait: false,
    timeout: 20000,
  },
});

// Elasticsearch configuration
export const createElasticsearchConfig = (configService: ConfigService) => ({
  node: configService.get<string>('ELASTICSEARCH_URL', 'http://localhost:9200'),
  maxRetries: 5,
  requestTimeout: 60000,
  sniffOnStart: true,
});

// File storage configuration
export const createFileStorageConfig = (configService: ConfigService) => ({
  provider: configService.get<string>('FILE_STORAGE_PROVIDER', 'local'), // 'local' | 's3' | 'gcs'
  local: {
    uploadPath: configService.get<string>('LOCAL_STORAGE_PATH', './uploads'),
    maxFileSize: configService.get<number>('MAX_FILE_SIZE', 10485760), // 10MB
    allowedTypes: configService.get<string>('ALLOWED_FILE_TYPES', 'jpg,jpeg,png,gif,pdf,doc,docx,txt,mp3,mp4,wav').split(','),
  },
  s3: {
    accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID'),
    secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY'),
    region: configService.get<string>('AWS_REGION', 'us-east-1'),
    bucket: configService.get<string>('AWS_S3_BUCKET'),
    endpoint: configService.get<string>('AWS_S3_ENDPOINT'),
    forcePathStyle: configService.get<boolean>('AWS_S3_FORCE_PATH_STYLE', false),
  },
});

// Email configuration
export const createEmailConfig = (configService: ConfigService) => ({
  transport: {
    host: configService.get<string>('SMTP_HOST'),
    port: configService.get<number>('SMTP_PORT', 587),
    secure: configService.get<boolean>('SMTP_SECURE', false),
    auth: {
      user: configService.get<string>('SMTP_USER'),
      pass: configService.get<string>('SMTP_PASS'),
    },
  },
  defaults: {
    from: configService.get<string>('EMAIL_FROM', 'AI Professor <noreply@ai-professor-verse.com>'),
  },
});

// Monitoring configuration
export const createMonitoringConfig = (configService: ConfigService) => ({
  prometheus: {
    enabled: configService.get<boolean>('PROMETHEUS_ENABLED', true),
    port: configService.get<number>('PROMETHEUS_PORT', 9090),
  },
  grafana: {
    url: configService.get<string>('GRAFANA_URL'),
    apiKey: configService.get<string>('GRAFANA_API_KEY'),
  },
  logging: {
    level: configService.get<string>('LOG_LEVEL', 'info'),
    format: configService.get<string>('LOG_FORMAT', 'json'),
    fileEnabled: configService.get<boolean>('LOG_FILE_ENABLED', true),
    filePath: configService.get<string>('LOG_FILE_PATH', './logs/app.log'),
    maxFiles: configService.get<string>('LOG_MAX_FILES', '7'),
    maxSize: configService.get<string>('LOG_MAX_SIZE', '10m'),
  },
});

// Security configuration
export const createSecurityConfig = (configService: ConfigService) => ({
  cors: {
    enabled: configService.get<boolean>('CORS_ENABLED', true),
    origins: configService.get<string>('CORS_ORIGINS', 'http://localhost:8080').split(','),
    credentials: configService.get<boolean>('CORS_CREDENTIALS', true),
    maxAge: configService.get<number>('CORS_MAX_AGE', 86400),
  },
  helmet: {
    enabled: configService.get<boolean>('HELMET_ENABLED', true),
    csp: configService.get<boolean>('CSP_ENABLED', true),
    hsts: configService.get<boolean>('HSTS_ENABLED', true),
  },
  rateLimit: {
    ttl: configService.get<number>('RATE_LIMIT_TTL', 60),
    limit: configService.get<number>('RATE_LIMIT_MAX', 100),
    authenticatedLimit: configService.get<number>('RATE_LIMIT_MAX_AUTHENTICATED', 1000),
    aiRequestsLimit: configService.get<number>('RATE_LIMIT_AI_REQUESTS', 20),
    codeExecutionLimit: configService.get<number>('RATE_LIMIT_CODE_EXECUTION', 10),
    fileUploadLimit: configService.get<number>('RATE_LIMIT_FILE_UPLOAD', 5),
  },
  encryption: {
    key: configService.get<string>('ENCRYPTION_KEY'),
    hashRounds: configService.get<number>('HASH_ROUNDS', 12),
  },
  session: {
    secret: configService.get<string>('SESSION_SECRET'),
    maxAge: configService.get<number>('SESSION_MAX_AGE', 86400000),
    secure: configService.get<boolean>('SECURE_COOKIES', false),
  },
});
