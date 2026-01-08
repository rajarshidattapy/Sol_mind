# Storage Architecture Overview

## Current Storage Locations

### ✅ Redis (Vercel KV) - Primary Storage
- **Chats** - All chat metadata (name, memory size, timestamps, etc.)
- **Messages** - All messages for each chat
- **User Preferences** - Settings, tab selections, etc.

### ✅ Supabase (PostgreSQL) - Relational Data
- **Agents** - Agent configurations, API keys, platform info
- **Capsules** - Memory capsule metadata (name, description, price, reputation)
- **Staking** - Staking records
- **Earnings** - Earnings history

### ✅ mem0 - Semantic Memory (Not Storage)
- **NOT for storing chats/agents/capsules**
- **Used for**: Extracting and storing semantic memories/knowledge from conversations
- **Purpose**: AI retrieves relevant memories when answering questions
- **Storage**: 
  - If `MEM0_API_KEY` set → Uses Mem0 Platform (hosted)
  - Otherwise → Uses local ChromaDB (`.chroma_db` folder)

## What mem0 Actually Does

mem0 is **NOT** a database for chats/agents/capsules. It's a **semantic memory system** that:

1. **Extracts knowledge** from conversations
2. **Stores semantic memories** (not raw messages)
3. **Retrieves relevant memories** when the AI needs context
4. **Isolates memories** per chat (using `chat_id` in metadata)

### Example Flow:

```
User: "What's my favorite programming language?"
  ↓
mem0 searches memories: "User mentioned Python multiple times"
  ↓
AI: "Based on our conversations, you prefer Python"
```

## Storage Breakdown

| Data Type | Storage | Purpose |
|-----------|---------|---------|
| **Chats** | Redis | Chat metadata, persistence |
| **Messages** | Redis | Conversation history |
| **Agents** | Supabase | Agent configs, API keys |
| **Capsules** | Supabase | Capsule metadata, marketplace |
| **User Preferences** | Redis | Settings, UI state |
| **Semantic Memories** | mem0 (ChromaDB/Platform) | AI knowledge extraction |

## Key Distinction

### mem0 vs Database Storage

**mem0 (Semantic Memory):**
- Stores **extracted knowledge** from conversations
- Example: "User prefers Python, works at tech company, likes AI"
- Used by AI to provide context-aware responses
- NOT the raw chat messages

**Redis/Supabase (Database Storage):**
- Stores **raw data** (chats, messages, agents, capsules)
- Example: "Message #1: 'Hello', Message #2: 'How are you?'"
- Used for persistence and retrieval
- The actual conversation data

## Current Status

### ✅ Migrated to Redis:
- Chats
- Messages
- User Preferences

### ✅ Still in Supabase:
- Agents
- Capsules
- Staking
- Earnings

### ✅ mem0 (Separate System):
- Semantic memories (knowledge extraction)
- Not migrated, works independently

## Summary

**No, capsules are NOT on mem0** - they're in Supabase.

**No, chats are NOT on mem0** - they're in Redis (we just migrated them).

**No, agents are NOT on mem0** - they're in Supabase.

**mem0** is a separate semantic memory system that extracts knowledge from conversations, but doesn't store the chats/agents/capsules themselves.

