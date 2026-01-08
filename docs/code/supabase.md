# Supabase Setup Guide

This directory contains Supabase migrations and configuration for SolMind.

## Setup Options

### Option 1: Link to Remote Supabase Project (Recommended)

1. **Get your Supabase project reference:**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Go to Settings → General
   - Copy your "Reference ID" (looks like `abcdefghijklmnopqrst`)

2. **Link your project:**
   ```bash
   cd backend
   npx supabase link --project-ref YOUR_PROJECT_REF
   ```
   You'll be prompted to enter your database password.

3. **Apply migrations:**
   ```bash
   npx supabase db push
   ```

4. **Get your connection details:**
   - Go to Settings → API in Supabase dashboard
   - Copy your `Project URL` and `anon` key
   - Add them to your `.env` file:
     ```env
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
     SUPABASE_SERVICE_KEY=your-service-key
     ```

### Option 2: Local Development (Requires Docker)

1. **Install Docker Desktop:**
   - Download from https://docs.docker.com/desktop
   - Start Docker Desktop

2. **Start local Supabase:**
   ```bash
   cd backend
   npx supabase start
   ```

3. **Apply migrations:**
   ```bash
   npx supabase db reset
   ```

4. **Get local connection details:**
   ```bash
   npx supabase status
   ```
   Copy the API URL and anon key to your `.env` file.

## Migration Files

All database schema changes are stored in `migrations/` directory.

- `20260103103639_initial_schema.sql` - Initial database schema

## Useful Commands

```bash
# View migration status
npx supabase migration list

# Create new migration
npx supabase migration new migration_name

# Apply migrations to remote
npx supabase db push

# Reset local database (applies all migrations)
npx supabase db reset

# Generate TypeScript types from database
npx supabase gen types typescript --linked > types/database.types.ts
```

## Database Schema

The complete schema includes:
- `agents` - AI agent configurations
- `chats` - Chat sessions
- `messages` - Chat messages
- `capsules` - Memory capsules
- `staking` - Staking records
- `earnings` - Earnings records

See `docs/DATABASE_SCHEMA.md` for full documentation.

