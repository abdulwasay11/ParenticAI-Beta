-- Create database (if not exists)
CREATE DATABASE parentic_ai;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant permissions to user
GRANT ALL PRIVILEGES ON DATABASE parentic_ai TO parentic_user; 