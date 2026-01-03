from fastapi import APIRouter, Query
from typing import Optional, List
from app.models.schemas import Capsule, MarketplaceFilters
from app.services.marketplace_service import MarketplaceService

router = APIRouter()


@router.get("/", response_model=List[Capsule])
async def browse_marketplace(
    category: Optional[str] = Query(None),
    min_reputation: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    sort_by: Optional[str] = Query("popular"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Browse marketplace capsules with filters"""
    filters = MarketplaceFilters(
        category=category,
        min_reputation=min_reputation,
        max_price=max_price,
        sort_by=sort_by
    )
    
    service = MarketplaceService()
    return await service.browse_capsules(filters, limit, offset)


@router.get("/trending", response_model=List[Capsule])
async def get_trending(limit: int = Query(10, ge=1, le=50)):
    """Get trending capsules"""
    service = MarketplaceService()
    return await service.get_trending_capsules(limit)


@router.get("/categories", response_model=List[str])
async def get_categories():
    """Get all available categories"""
    service = MarketplaceService()
    return await service.get_categories()


@router.get("/search", response_model=List[Capsule])
async def search_capsules(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Search capsules by name or description"""
    service = MarketplaceService()
    return await service.search_capsules(q, limit)

