from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import logging

from app.api.v1 import agents, marketplace, capsules, wallet, auth, preferences
from app.core.config import settings
from app.db.database import init_db

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting SolMind API...")
    await init_db()
    
    # Initialize memory service (warm up)
    try:
        from app.services.memory_service import MemoryService
        memory_service = MemoryService()
        if memory_service._is_available():
            logger.info("Memory service initialized successfully")
        else:
            logger.warning("Memory service not available (mem0 may not be configured)")
    except Exception as e:
        logger.warning(f"Memory service initialization failed: {e}")
    
    yield
    # Shutdown
    logger.info("Shutting down SolMind API...")


app = FastAPI(
    title="SolMind API",
    description="Backend API for SolMind is running!",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware - Allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(agents.router, prefix="/api/v1/agents", tags=["Agents"])
app.include_router(capsules.router, prefix="/api/v1/capsules", tags=["Capsules"])
app.include_router(marketplace.router, prefix="/api/v1/marketplace", tags=["Marketplace"])
app.include_router(wallet.router, prefix="/api/v1/wallet", tags=["Wallet"])
app.include_router(preferences.router, prefix="/api/v1", tags=["Preferences"])


@app.get("/")
async def root():
    return {
        "message": "SolMind API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )

