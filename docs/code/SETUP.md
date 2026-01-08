# SolMind Setup Guide

This guide will help you set up both the frontend and backend for SolMind.

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Supabase account (optional, for database)
- LLM API keys (OpenAI, Anthropic, or Mistral)

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
- Windows: `venv\Scripts\activate`
- Mac/Linux: `source venv/bin/activate`

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create `.env` file:
```bash
cp .env.example .env
```

6. Edit `.env` and add your configuration:
```env
# App Configuration
DEBUG=True
HOST=0.0.0.0
PORT=8000

# Supabase (optional - leave empty if not using)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# LLM API Keys (at least one required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
MISTRAL_API_KEY=...

# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com
```

7. Start the backend server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

## Frontend Setup

1. Install dependencies (from project root):
```bash
npm install
```

2. Create `.env` file in project root (optional):
```env
VITE_API_BASE_URL=http://localhost:8000
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:8080`

## Database Setup (Optional)

If you're using Supabase:

1. Create a new Supabase project
2. Run the following SQL to create tables:

```sql
-- Agents table
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  platform TEXT NOT NULL,
  api_key_configured BOOLEAN DEFAULT false,
  model TEXT,
  user_wallet TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chats table
CREATE TABLE chats (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  memory_size TEXT NOT NULL,
  last_message TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  agent_id TEXT,
  user_wallet TEXT,
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- Messages table
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
);

-- Capsules table
CREATE TABLE capsules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  creator_wallet TEXT NOT NULL,
  price_per_query NUMERIC DEFAULT 0,
  stake_amount NUMERIC DEFAULT 0,
  reputation NUMERIC DEFAULT 0,
  query_count INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

-- Staking table
CREATE TABLE staking (
  id SERIAL PRIMARY KEY,
  capsule_id TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  stake_amount NUMERIC NOT NULL,
  staked_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (capsule_id) REFERENCES capsules(id)
);

-- Earnings table
CREATE TABLE earnings (
  id SERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  capsule_id TEXT,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Testing the Connection

1. Start the backend server
2. Start the frontend server
3. Connect your Solana wallet (Phantom)
4. Navigate to the Agents tab
5. Create a new chat and send a message

The frontend will automatically proxy API requests to the backend.

## Troubleshooting

### Backend won't start
- Check that Python 3.10+ is installed
- Verify all dependencies are installed: `pip install -r requirements.txt`
- Check that port 8000 is not in use

### Frontend can't connect to backend
- Ensure backend is running on port 8000
- Check CORS settings in `backend/app/core/config.py`
- Verify `VITE_API_BASE_URL` in frontend `.env`

### API calls failing
- Check that wallet is connected (required for most endpoints)
- Verify API keys are set in backend `.env`
- Check browser console for error messages

### Database errors
- If Supabase is not configured, the app will use in-memory storage
- Some features require database setup
- Check Supabase dashboard for connection issues

## Development Notes

- The backend uses FastAPI with automatic API documentation
- Frontend uses Vite with React and TypeScript
- Wallet authentication is done via `X-Wallet-Address` header
- All API endpoints require wallet connection (except marketplace browse)

## Next Steps

1. Configure Supabase for persistent storage
2. Add your LLM API keys
3. Test chat functionality
4. Explore marketplace features
5. Set up capsule creation and staking

