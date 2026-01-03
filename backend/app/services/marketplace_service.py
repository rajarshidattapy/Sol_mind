from typing import List
from app.db.database import get_supabase
from app.models.schemas import Capsule, MarketplaceFilters


class MarketplaceService:
    def __init__(self):
        self.supabase = get_supabase()
    
    def _check_supabase(self):
        """Helper to check if Supabase is available, raises exception if not"""
        if not self.supabase:
            raise Exception("Supabase not configured")
    
    async def browse_capsules(self, filters: MarketplaceFilters, limit: int, offset: int) -> List[Capsule]:
        """Browse marketplace with filters"""
        try:
            self._check_supabase()
            query = self.supabase.table("capsules").select("*")
            
            if filters.category:
                query = query.eq("category", filters.category)
            if filters.min_reputation:
                query = query.gte("reputation", filters.min_reputation)
            if filters.max_price:
                query = query.lte("price_per_query", filters.max_price)
            
            # Sorting
            if filters.sort_by == "popular":
                query = query.order("query_count", desc=True)
            elif filters.sort_by == "newest":
                query = query.order("created_at", desc=True)
            elif filters.sort_by == "price_low":
                query = query.order("price_per_query", desc=False)
            elif filters.sort_by == "price_high":
                query = query.order("price_per_query", desc=True)
            elif filters.sort_by == "rating":
                query = query.order("rating", desc=True)
            
            result = query.range(offset, offset + limit - 1).execute()
            return [Capsule(**row) for row in result.data]
        except Exception as e:
            print(f"Error browsing marketplace: {e}")
            return []
    
    async def get_trending_capsules(self, limit: int) -> List[Capsule]:
        """Get trending capsules"""
        try:
            self._check_supabase()
            result = self.supabase.table("capsules").select("*").order("query_count", desc=True).limit(limit).execute()
            return [Capsule(**row) for row in result.data]
        except Exception as e:
            print(f"Error fetching trending: {e}")
            return []
    
    async def get_categories(self) -> List[str]:
        """Get all available categories"""
        try:
            self._check_supabase()
            result = self.supabase.table("capsules").select("category").execute()
            categories = list(set([row["category"] for row in result.data]))
            return sorted(categories)
        except Exception as e:
            print(f"Error fetching categories: {e}")
            return ["Finance", "Gaming", "Health", "Technology", "Education"]
    
    async def search_capsules(self, query: str, limit: int) -> List[Capsule]:
        """Search capsules by name or description"""
        try:
            self._check_supabase()
            # Supabase text search (if configured)
            result = self.supabase.table("capsules").select("*").or_(f"name.ilike.%{query}%,description.ilike.%{query}%").limit(limit).execute()
            return [Capsule(**row) for row in result.data]
        except Exception as e:
            print(f"Error searching capsules: {e}")
            return []

