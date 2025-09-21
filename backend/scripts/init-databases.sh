#!/bin/bash
set -e

# Initialize multiple PostgreSQL databases for microservices
# This script is executed by the PostgreSQL Docker container on startup

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create databases for different services
    CREATE DATABASE auth_db;
    CREATE DATABASE user_db;
    CREATE DATABASE analytics_db;
    CREATE DATABASE content_db;
    CREATE DATABASE keycloak_db;
    
    -- Create users for different services (optional, for better security)
    CREATE USER auth_service WITH ENCRYPTED PASSWORD 'auth_service_password';
    CREATE USER user_service WITH ENCRYPTED PASSWORD 'user_service_password';
    CREATE USER analytics_service WITH ENCRYPTED PASSWORD 'analytics_service_password';
    CREATE USER content_service WITH ENCRYPTED PASSWORD 'content_service_password';
    
    -- Grant privileges
    GRANT ALL PRIVILEGES ON DATABASE auth_db TO auth_service;
    GRANT ALL PRIVILEGES ON DATABASE user_db TO user_service;
    GRANT ALL PRIVILEGES ON DATABASE analytics_db TO analytics_service;
    GRANT ALL PRIVILEGES ON DATABASE content_db TO content_service;
    GRANT ALL PRIVILEGES ON DATABASE keycloak_db TO "$POSTGRES_USER";
    
    -- Create extensions
    \c auth_db;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    
    \c user_db;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    
    \c analytics_db;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
    
    \c content_db;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    
    \c keycloak_db;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOSQL

echo "✅ All databases initialized successfully!"
