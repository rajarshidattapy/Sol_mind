from typing import List, Optional
from datetime import datetime
from app.db.database import get_supabase
from app.models.schemas import WalletBalance, Earnings, StakingInfo, StakingCreate
from app.core.config import settings
import httpx


class WalletService:
    def __init__(self):
        self.supabase = get_supabase()
        self.solana_rpc_url = settings.SOLANA_RPC_URL
    
    def _check_supabase(self):
        """Helper to check if Supabase is available, raises exception if not"""
        if not self.supabase:
            raise Exception("Supabase not configured")
    
    async def get_balance(self, wallet_address: str) -> WalletBalance:
        """Get SOL balance for a wallet"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.solana_rpc_url,
                    json={
                        "jsonrpc": "2.0",
                        "id": 1,
                        "method": "getBalance",
                        "params": [wallet_address]
                    },
                    timeout=10.0
                )
                data = response.json()
                if "result" in data:
                    balance_lamports = data["result"]["value"]
                    balance_sol = balance_lamports / 1e9  # Convert lamports to SOL
                    return WalletBalance(
                        wallet_address=wallet_address,
                        balance=balance_sol,
                        currency="SOL"
                    )
        except Exception as e:
            print(f"Error fetching balance: {e}")
        
        return WalletBalance(
            wallet_address=wallet_address,
            balance=0.0,
            currency="SOL"
        )
    
    async def get_earnings(self, wallet_address: str, period: Optional[str] = None) -> Earnings:
        """Get earnings for a wallet"""
        try:
            self._check_supabase()
            query = self.supabase.table("earnings").select("*").eq("wallet_address", wallet_address)
            if period:
                # Filter by period (not implemented yet)
                pass
            
            result = query.execute()
            total = sum(row.get("amount", 0) for row in result.data)
            
            return Earnings(
                wallet_address=wallet_address,
                total_earnings=total,
                capsule_earnings=result.data,
                period=period
            )
        except Exception as e:
            print(f"Error fetching earnings: {e}")
            return Earnings(
                wallet_address=wallet_address,
                total_earnings=0.0,
                capsule_earnings=[],
                period=period
            )
    
    async def get_staking_info(self, wallet_address: str) -> List[StakingInfo]:
        """Get staking information for a wallet"""
        try:
            self._check_supabase()
            result = self.supabase.table("staking").select("*").eq("wallet_address", wallet_address).execute()
            return [StakingInfo(**row) for row in result.data]
        except Exception as e:
            print(f"Error fetching staking info: {e}")
            return []
    
    async def create_staking(self, staking: StakingCreate, wallet_address: str) -> StakingInfo:
        """Create a new staking entry"""
        staking_info = StakingInfo(
            capsule_id=staking.capsule_id,
            wallet_address=wallet_address,
            stake_amount=staking.stake_amount,
            staked_at=datetime.now()
        )
        
        try:
            self._check_supabase()
            self.supabase.table("staking").insert({
                "capsule_id": staking.capsule_id,
                "wallet_address": wallet_address,
                "stake_amount": staking.stake_amount,
                "staked_at": staking_info.staked_at.isoformat()
            }).execute()
            
            # Update capsule stake amount
            self.supabase.rpc("increment_stake", {
                "capsule_id": staking.capsule_id,
                "amount": staking.stake_amount
            }).execute()
        except Exception as e:
            print(f"Error creating staking: {e}")
        
        return staking_info

