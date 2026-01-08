# SolMind Backend API

FastAPI backend for SolMind - Stateful AI Runtime.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
   - Add your Supabase URL and keys
   - Add LLM API keys (OpenAI, Anthropic, Mistral)
   - Configure Solana RPC URL

4. Run the server:
```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Authentication
- `POST /api/v1/auth/verify-wallet` - Verify wallet signature
- `GET /api/v1/auth/me` - Get current user

### Agents
- `GET /api/v1/agents/` - List all agents
- `POST /api/v1/agents/` - Create new agent
- `GET /api/v1/agents/{agent_id}/chats` - List chats for agent
- `POST /api/v1/agents/{agent_id}/chats` - Create new chat
- `GET /api/v1/agents/{agent_id}/chats/{chat_id}` - Get chat with messages
- `POST /api/v1/agents/{agent_id}/chats/{chat_id}/messages` - Send message
- `GET /api/v1/agents/{agent_id}/chats/{chat_id}/messages` - Get messages

### Capsules
- `GET /api/v1/capsules/` - List user capsules
- `POST /api/v1/capsules/` - Create new capsule
- `GET /api/v1/capsules/{capsule_id}` - Get capsule
- `PUT /api/v1/capsules/{capsule_id}` - Update capsule
- `POST /api/v1/capsules/{capsule_id}/query` - Query capsule

### Marketplace
- `GET /api/v1/marketplace/` - Browse marketplace
- `GET /api/v1/marketplace/trending` - Get trending capsules
- `GET /api/v1/marketplace/categories` - Get categories
- `GET /api/v1/marketplace/search?q=query` - Search capsules

### Wallet
- `GET /api/v1/wallet/balance` - Get wallet balance
- `GET /api/v1/wallet/earnings` - Get earnings
- `GET /api/v1/wallet/staking` - Get staking info
- `POST /api/v1/wallet/staking` - Create staking

## Authentication

Currently, the API uses wallet address in the `X-Wallet-Address` header for authentication. In production, you should implement proper wallet signature verification.

## Database Schema

The backend expects the following Supabase tables:
- `agents` - Agent/LLM configurations
- `chats` - Chat sessions
- `messages` - Chat messages
- `capsules` - Memory capsules
- `staking` - Staking records
- `earnings` - Earnings records

Tables will be created automatically on first use if Supabase is configured, or you can create them manually using the Supabase dashboard.

