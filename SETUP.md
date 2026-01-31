# Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and update with your values:
```bash
cp .env.example .env
```

Required environment variables:
- `JWT_SECRET` - Secure random string for JWT tokens
- `DATABASE_URL` or individual `DB_*` variables for PostgreSQL connection

### 3. Setup Database
Run the database initialization:
```bash
npm run db:setup
```

Or manually run the SQL files in this order:
1. `server/db.sql` - Base schema
2. `supabase_currency_migration.sql` - Multi-currency support
3. `supabase_enable_rls_custom_auth.sql` - Row Level Security (for Supabase)

### 4. Start the Application
```bash
npm start  # Starts both frontend and backend
```

## Features

- **Finance Management**: Track income, expenses, and debts with multi-currency support
- **Task Planning**: Kanban board with priority management
- **Smart Analytics**: AI-powered insights and forecasting
- **Automated Exchange Rates**: Daily automatic updates from free API
- **Security**: JWT authentication with Row Level Security

## Database Notes

### Row Level Security (RLS)
If using Supabase, enable RLS with `supabase_enable_rls_custom_auth.sql`. This requires updating database queries to pass user context. See `server/db_with_rls.js` for implementation.

### Exchange Rates
Exchange rates automatically update every 24 hours using a free API. No manual intervention required.

## Deployment

Configured for Vercel deployment. Set environment variables in your hosting platform dashboard.

## Security

- All passwords are hashed with bcrypt
- JWT tokens expire after 1 day
- Rate limiting enabled (100 requests per 15 minutes)
- SSL/TLS for database connections
- Row Level Security for data isolation
