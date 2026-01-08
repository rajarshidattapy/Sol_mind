# 🚨 Production Deployment Fixes - BREAK.md

This document outlines **critical changes** needed to prevent production failures when deploying to:
- **Frontend**: Vercel
- **Backend**: Render

---

## 🔴 CRITICAL ISSUES (Will Break Production)

### 1. **Frontend: Hardcoded localhost API URL**

**Location**: `src/lib/api.ts:3`

**Problem**: 
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
```
This will try to connect to localhost in production, causing all API calls to fail.

**Fix**:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL environment variable is required');
}
```

**Action Required**:
- Set `VITE_API_BASE_URL` in Vercel environment variables to your Render backend URL
- Example: `https://your-backend.onrender.com`

---

### 2. **Backend: CORS Allows All Origins (Security Risk)**

**Location**: `backend/main.py:48-55`

**Problem**:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ Allows ANY origin - security risk!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Fix**:
```python
from app.core.config import settings

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,  # Use configured origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "X-Wallet-Address"],
)
```

**Action Required**:
- Set `CORS_ORIGINS` in Render environment variables
- Format: `https://your-frontend.vercel.app,https://www.yourdomain.com`
- Or as JSON array: `["https://your-frontend.vercel.app"]`

---

### 3. **Backend: Insecure Default SECRET_KEY**

**Location**: `backend/app/core/config.py:103`

**Problem**:
```python
SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
```
If SECRET_KEY is not set, uses a default that's publicly visible in code.

**Fix**:
```python
SECRET_KEY: str = Field(
    default="",
    description="Secret key for JWT tokens (REQUIRED in production)"
)

@field_validator("SECRET_KEY")
@classmethod
def validate_secret_key(cls, v: str) -> str:
    if not v or v == "your-secret-key-change-in-production":
        import os
        if os.getenv("ENVIRONMENT") == "production":
            raise ValueError("SECRET_KEY must be set in production")
    return v
```

**Action Required**:
- Generate a secure random key: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- Set `SECRET_KEY` in Render environment variables

---

### 4. **Backend: Missing Render Deployment Configuration**

**Problem**: No `render.yaml` or `Procfile` to tell Render how to start the app.

**Fix**: Create `render.yaml` in project root:
```yaml
services:
  - type: web
    name: solmind-backend
    env: python
    buildCommand: cd backend && pip install -r requirements.txt
    startCommand: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PORT
        value: 8000
      - key: PYTHON_VERSION
        value: 3.11.0
    healthCheckPath: /health
```

**Action Required**:
- Create `render.yaml` file in project root
- Or create `Procfile` in `backend/` directory:
  ```
  web: uvicorn main:app --host 0.0.0.0 --port $PORT
  ```

---

### 5. **Backend: ChromaDB Local Storage Won't Work on Render**

**Location**: `backend/app/services/memory_service.py:89`

**Problem**:
```python
"path": "./.chroma_db"  # Local storage - won't persist on Render!
```
Render has an ephemeral filesystem. Data in `.chroma_db` will be lost on every deploy/restart.

**Fix**: 
- **Option 1**: Use Mem0 Platform (recommended for production)
  - Set `MEM0_API_KEY` in Render environment variables
  - This uses hosted storage that persists

- **Option 2**: Use external ChromaDB (if you must use local)
  - Configure ChromaDB to use a persistent volume or external service
  - Not recommended for Render

**Action Required**:
- Set `MEM0_API_KEY` in Render environment variables (get from mem0.ai)
- Or configure external ChromaDB storage

---

### 6. **Backend: Port Configuration Issue**

**Location**: `backend/app/core/config.py:22`

**Problem**:
```python
PORT: int = int(os.getenv("PORT", "8000"))
```
Render automatically sets `PORT` environment variable. The code should use it, but needs validation.

**Fix**:
```python
PORT: int = int(os.getenv("PORT", "8000"))

@field_validator("PORT")
@classmethod
def validate_port(cls, v: int) -> int:
    if v < 1 or v > 65535:
        raise ValueError("PORT must be between 1 and 65535")
    return v
```

**Action Required**:
- Render automatically sets `PORT` - no action needed
- But ensure `HOST=0.0.0.0` is set (already correct)

---

## 🟡 HIGH PRIORITY ISSUES (May Cause Problems)

### 7. **Frontend: Missing Environment Variable Validation**

**Location**: `src/lib/api.ts`

**Problem**: No validation that required env vars are set before app starts.

**Fix**: Add validation in `src/main.tsx`:
```typescript
// Validate required environment variables
if (!import.meta.env.VITE_API_BASE_URL) {
  console.error('❌ VITE_API_BASE_URL is not set!');
  // Show user-friendly error in production
  if (import.meta.env.PROD) {
    document.body.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif;">
        <div style="text-align: center;">
          <h1>Configuration Error</h1>
          <p>VITE_API_BASE_URL environment variable is not set.</p>
          <p>Please contact the administrator.</p>
        </div>
      </div>
    `;
  }
}
```

**Action Required**:
- Add environment variable validation
- Set all required env vars in Vercel dashboard

---

### 8. **Backend: Database Initialization May Fail Silently**

**Location**: `backend/app/db/database.py:59-92`

**Problem**: If Supabase connection fails, app continues with in-memory storage but doesn't fail fast in production.

**Fix**: Add production check:
```python
async def init_db():
    """Initialize database connection and create tables if needed"""
    supabase = get_supabase()
    
    if not supabase:
        is_production = os.getenv("ENVIRONMENT") == "production" or not os.getenv("DEBUG", "").lower() == "true"
        if is_production:
            raise RuntimeError(
                "CRITICAL: Supabase is not configured in production! "
                "Set VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables."
            )
        # Only allow in-memory in development
        print("⚠️  WARNING: Supabase not configured - using in-memory storage (DEV ONLY)")
        return
    # ... rest of code
```

**Action Required**:
- Ensure `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are set in Render
- Test database connection before deploying

---

### 9. **Backend: Memory Service Initialization May Fail**

**Location**: `backend/main.py:26-34`

**Problem**: Memory service failure is logged but doesn't prevent startup. In production, this should be more strict.

**Fix**:
```python
# Initialize memory service (warm up)
try:
    from app.services.memory_service import MemoryService
    memory_service = MemoryService()
    if not memory_service._is_available():
        is_production = not settings.DEBUG
        if is_production:
            logger.warning("Memory service not available in production - some features may not work")
        else:
            logger.warning("Memory service not available (mem0 may not be configured)")
except Exception as e:
    logger.error(f"Memory service initialization failed: {e}")
    if not settings.DEBUG:
        logger.warning("Continuing without memory service - some features disabled")
```

**Action Required**:
- Set `MEM0_API_KEY` in Render if you want memory features
- Or accept that memory features won't work (app will still function)

---

### 10. **Frontend: Vite Proxy Configuration in Production**

**Location**: `vite.config.ts:11-16`

**Problem**: 
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8000',  // Only works in dev!
    changeOrigin: true,
  }
}
```
This proxy only works in development. In production (Vercel), you need to use the actual API URL.

**Fix**: No fix needed - Vite proxy is dev-only. Production uses `VITE_API_BASE_URL` directly.

**Action Required**:
- Ensure `VITE_API_BASE_URL` is set correctly in Vercel
- The proxy config is fine (only used in dev)

---

### 11. **Backend: Health Check Endpoint Needs Validation**

**Location**: `backend/main.py:75-77`

**Problem**: Health check doesn't verify critical services are available.

**Fix**:
```python
@app.get("/health")
async def health_check():
    """Health check endpoint with service validation"""
    status = {
        "status": "healthy",
        "services": {}
    }
    
    # Check database
    supabase = get_supabase()
    status["services"]["database"] = "available" if supabase else "unavailable"
    
    # Check Redis/KV (optional)
    from app.services.cache_service import cache_service
    status["services"]["cache"] = "available" if cache_service.redis_available else "unavailable"
    
    # Check memory service (optional)
    try:
        from app.services.memory_service import MemoryService
        memory_service = MemoryService()
        status["services"]["memory"] = "available" if memory_service._is_available() else "unavailable"
    except:
        status["services"]["memory"] = "unavailable"
    
    # Return 503 if critical services are down in production
    if not settings.DEBUG and not supabase:
        from fastapi import status as http_status
        return JSONResponse(
            content=status,
            status_code=http_status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    return status
```

**Action Required**:
- Implement enhanced health check
- Configure Render to use `/health` endpoint

---

## 🟢 MEDIUM PRIORITY ISSUES (Best Practices)

### 12. **Environment Variable Documentation**

**Problem**: No clear list of required vs optional env vars for production.

**Fix**: Create `DEPLOYMENT.md` with:
- Required environment variables for production
- Optional environment variables
- How to get values for each service

**Action Required**:
- Document all environment variables
- Mark which are required vs optional

---

### 13. **Error Handling for API Failures**

**Location**: `src/lib/api.ts:33-36`

**Problem**: Generic error handling may not provide useful feedback.

**Fix**: Add better error messages:
```typescript
if (!response.ok) {
  let errorMessage = 'Unknown error';
  try {
    const error = await response.json();
    errorMessage = error.message || error.detail || `HTTP ${response.status}`;
  } catch {
    if (response.status === 0) {
      errorMessage = 'Cannot connect to server. Check your internet connection and API URL.';
    } else {
      errorMessage = `HTTP error! status: ${response.status}`;
    }
  }
  throw new Error(errorMessage);
}
```

**Action Required**:
- Improve error handling for better user experience
- Add retry logic for network failures

---

### 14. **Backend: Logging Configuration**

**Location**: `backend/main.py:12-15`

**Problem**: Logging level may be too verbose in production.

**Fix**:
```python
import logging
import os

log_level = logging.INFO
if os.getenv("DEBUG", "False").lower() == "true":
    log_level = logging.DEBUG
elif os.getenv("ENVIRONMENT") == "production":
    log_level = logging.WARNING  # Less verbose in production

logging.basicConfig(
    level=log_level,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

**Action Required**:
- Configure appropriate log levels
- Set up log aggregation if needed (Render has built-in logging)

---

### 15. **Frontend: Build Optimization**

**Location**: `vite.config.ts`

**Problem**: No production build optimizations configured.

**Fix**: Add build optimizations:
```typescript
export default defineConfig(({ mode }) => ({
  // ... existing config
  build: {
    minify: 'esbuild',
    sourcemap: mode === 'production' ? false : true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'solana': ['@solana/web3.js', '@solana/wallet-adapter-react'],
        }
      }
    }
  }
}));
```

**Action Required**:
- Optimize build for production
- Test build locally: `npm run build`

---

## 📋 DEPLOYMENT CHECKLIST

### Before Deploying to Vercel (Frontend):

- [ ] Set `VITE_API_BASE_URL` to your Render backend URL
- [ ] Set `VITE_SUPABASE_URL` (if using Supabase)
- [ ] Set `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (if using Supabase)
- [ ] Test build locally: `npm run build`
- [ ] Verify `vercel.json` is correct
- [ ] Check that no hardcoded localhost URLs remain

### Before Deploying to Render (Backend):

- [ ] Create `render.yaml` or `Procfile` in `backend/` directory
- [ ] Set `CORS_ORIGINS` to your Vercel frontend URL(s)
- [ ] Set `SECRET_KEY` to a secure random value
- [ ] Set `VITE_SUPABASE_URL` (required for production)
- [ ] Set `SUPABASE_SERVICE_KEY` (required for production)
- [ ] Set `MEM0_API_KEY` (optional, but recommended)
- [ ] Set `KV_REST_API_URL` and `KV_REST_API_TOKEN` (optional, for Redis)
- [ ] Set `OPENROUTER_API_KEY` (if using OpenRouter)
- [ ] Set `SOLANA_RPC_URL` (use mainnet URL for production)
- [ ] Set `SOLANA_NETWORK=mainnet-beta` (for production)
- [ ] Set `DEBUG=False` (for production)
- [ ] Set `HOST=0.0.0.0` (already default, but verify)
- [ ] Verify health check endpoint works: `/health`
- [ ] Test database connection
- [ ] Test Redis connection (if using)

### Post-Deployment Verification:

- [ ] Frontend loads without errors
- [ ] API calls from frontend succeed
- [ ] CORS headers are correct (check browser console)
- [ ] Database operations work (create agent, chat, etc.)
- [ ] Health check endpoint returns 200
- [ ] Logs show no critical errors
- [ ] Memory service works (if configured)
- [ ] Redis cache works (if configured)

---

## 🔧 QUICK FIXES SUMMARY

1. **Frontend API URL**: Remove localhost fallback, require `VITE_API_BASE_URL`
2. **CORS**: Restrict to your frontend domain(s)
3. **SECRET_KEY**: Require secure key in production
4. **Render Config**: Add `render.yaml` or `Procfile`
5. **ChromaDB**: Use Mem0 Platform or external storage
6. **Health Check**: Add service validation
7. **Error Handling**: Improve user-facing error messages
8. **Environment Variables**: Document and validate all required vars

---

## 🚀 DEPLOYMENT COMMANDS

### Vercel (Frontend):
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Or connect via GitHub and auto-deploy
```

### Render (Backend):
```bash
# Create render.yaml (see fix #4)
# Then connect via Render dashboard:
# 1. Go to render.com
# 2. New → Web Service
# 3. Connect your GitHub repo
# 4. Render will auto-detect render.yaml
# 5. Add environment variables
# 6. Deploy
```

---

## 📞 SUPPORT

If you encounter issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Check Vercel logs: Dashboard → Your Project → Deployments → View Function Logs
3. Verify all environment variables are set correctly
4. Test health check endpoint: `https://your-backend.onrender.com/health`
5. Check browser console for CORS errors
6. Verify API URL is correct in frontend

---

**Last Updated**: 2025-01-XX
**Status**: ⚠️ Critical fixes required before production deployment

