-- Tip Jar Frames Database Initialization
-- This file is used to initialize any database if needed

-- Enable UUID extension (if using PostgreSQL)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables for tip jar data, users, transactions, etc. (if needed)
-- Add any initial schema setup here

-- Example: Tip transactions table (adjust as needed)
-- CREATE TABLE IF NOT EXISTS tip_transactions (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     transaction_hash VARCHAR(66) UNIQUE NOT NULL,
--     from_address VARCHAR(42) NOT NULL,
--     to_address VARCHAR(42) NOT NULL,
--     amount DECIMAL(36,18) NOT NULL,
--     token_address VARCHAR(42),
--     tip_jar_contract VARCHAR(42) NOT NULL,
--     farcaster_fid BIGINT,
--     block_number BIGINT NOT NULL,
--     block_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );

-- Example: Users/Farcaster profiles table (adjust as needed)
-- CREATE TABLE IF NOT EXISTS farcaster_users (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     fid BIGINT UNIQUE NOT NULL,
--     username VARCHAR(255) UNIQUE,
--     display_name VARCHAR(255),
--     wallet_address VARCHAR(42),
--     verified_at TIMESTAMP WITH TIME ZONE,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );

-- Example: Tip jars table (adjust as needed)
-- CREATE TABLE IF NOT EXISTS tip_jars (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     contract_address VARCHAR(42) UNIQUE NOT NULL,
--     owner_address VARCHAR(42) NOT NULL,
--     name VARCHAR(255),
--     description TEXT,
--     total_tips DECIMAL(36,18) DEFAULT 0,
--     tip_count INTEGER DEFAULT 0,
--     farcaster_fid BIGINT,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );

-- Add any other initial database setup here