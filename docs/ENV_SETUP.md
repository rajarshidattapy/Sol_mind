# Environment Variables Setup Guide

This guide explains how to set up environment variables for both frontend and backend.

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Copy the example file:
```bash
# Windows
copy env.example .env

# Mac/Linux
cp env.example .env
```

3. Edit `.env` and configure the following:

### Required (for basic functionality):
- `PORT=8000` - Backend server port
- `CORS_ORIGINS` - Frontend URLs (already configured for localhost)

### Optional but Recommended:
- **Supabase** - For persistent storage (chats, agents, messages)
  - Get your keys from: https://app.supabase.com
  - If not set, the app uses in-memory storage (works for development)

- **LLM API Keys** - For default agents (claude, gpt, mistral)
  - You can skip these and use OpenRouter with custom agents instead
  - OpenAI: https://platform.openai.com/api-keys
  - Anthropic: https://console.anthropic.com/settings/keys
  - Mistral: https://console.mistral.ai/api-keys

### Solana Configuration:
- `SOLANA_RPC_URL` - Already set to devnet
- Change to mainnet for production

### Security:
- `SECRET_KEY` - Generate a secure random string for production:
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(32))"
  ```

## Frontend Setup

1. In the project root, copy the example file:
```bash
# Windows
copy env.example .env

# Mac/Linux
cp env.example .env
```

2. Edit `.env` and configure:

### Optional:
- `VITE_API_BASE_URL` - Backend API URL
  - Default: `http://localhost:8000`
  - Only needed if backend runs on a different URL
  - The vite proxy is already configured for `/api` routes

## Quick Start (Minimal Setup)

### Backend:
```bash
cd backend
copy env.example .env
# Edit .env - at minimum, you can leave everything as-is for development
python main.py
```

### Frontend:
```bash
# In project root
copy env.example .env
# .env can be empty or use defaults
npm install
npm run dev
```

## Notes

- **In-memory storage**: If Supabase is not configured, the backend uses in-memory storage. This works for development but data is lost on restart.
- **Custom agents**: You can create agents with OpenRouter API keys directly in the UI - no backend env vars needed!
- **Default agents**: The default agents (claude, gpt, mistral) will only work if you provide their respective API keys in the backend `.env`.

## Production Checklist

- [ ] Set `DEBUG=False` in backend `.env`
- [ ] Generate a secure `SECRET_KEY`
- [ ] Configure Supabase for persistent storage
- [ ] Set up proper CORS origins
- [ ] Use mainnet Solana RPC URL
- [ ] Remove or secure API keys
- [ ] Set up proper error logging

