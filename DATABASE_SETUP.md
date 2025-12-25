# Database Setup Guide

This guide explains how to set up the Neon PostgreSQL database for ParenticAI.

## Prerequisites

- Neon PostgreSQL database credentials (provided in Vercel)
- Access to Vercel dashboard for environment variables

## Environment Variables

Add the following environment variables to your Vercel project:

### Required Database Variables

```
DATABASE_URL=postgresql://neondb_owner:npg_HWbYpxdhMl24@ep-bold-sunset-adtxlvgr-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

Or use:

```
POSTGRES_URL=postgresql://neondb_owner:npg_HWbYpxdhMl24@ep-bold-sunset-adtxlvgr-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## Database Initialization

### Option 1: Using the API Endpoint (Recommended)

After deploying to Vercel, call the initialization endpoint once:

```bash
curl -X POST https://your-domain.vercel.app/api/init-db-endpoint
```

This will create all necessary tables and indexes.

### Option 2: Manual SQL Execution

Connect to your Neon database and run the SQL from `frontend/api/init-db.js` manually.

## Database Schema

The database includes the following tables:

1. **users** - User accounts linked to Firebase UID
2. **parents** - Parent profiles with parenting style, score, and tracking
3. **children** - Children profiles with detailed information
4. **personality_assessments** - AI personality assessment results
5. **parent_tracking** - Daily tracking of parent interactions and progress

## API Endpoints

All API endpoints are located in the `frontend/api/` directory:

- `/api/users` - User management
- `/api/parents` - Parent profile management
- `/api/children` - Children data management
- `/api/personality-assessment` - Personality assessment storage
- `/api/parent-tracking` - Parent activity tracking
- `/api/child-options` - Dropdown options for child forms
- `/api/init-db-endpoint` - Database initialization (one-time use)

## Features

### Children Database
- Store comprehensive child information
- Track hobbies, interests, personality traits
- Maintain school and development data

### Parent Profile Building
- Track parenting score over time
- Identify parenting style
- Monitor improvement areas and strengths
- Record daily interactions and progress

### Personality Assessment
- Store AI-powered personality assessments
- Link assessments to child profiles
- Maintain assessment history
- Store quiz data and AI analysis

## Troubleshooting

### Database Connection Issues

1. Verify `DATABASE_URL` or `POSTGRES_URL` is set in Vercel
2. Check that SSL mode is enabled (`sslmode=require`)
3. Ensure the database is accessible from Vercel's IP ranges

### Missing Tables

If you get errors about missing tables, run the initialization endpoint:

```bash
curl -X POST https://your-domain.vercel.app/api/init-db-endpoint
```

### Authentication Errors

Ensure Firebase authentication tokens are being passed correctly in API requests. The frontend automatically includes the token in the `Authorization` header.

## Next Steps

1. Deploy to Vercel
2. Set environment variables in Vercel dashboard
3. Initialize database using the API endpoint
4. Test user registration and profile creation
5. Add children profiles
6. Test personality assessment features

