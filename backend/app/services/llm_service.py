from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.models.schemas import Agent, LLMResponse
from app.services.memory_service import MemoryService
import httpx
import json
import logging

logger = logging.getLogger(__name__)


class LLMService:
    def __init__(self):
        self.openai_base = "https://api.openai.com/v1"
        self.anthropic_base = "https://api.anthropic.com/v1"
        self.mistral_base = "https://api.mistral.ai/v1"
        self.openrouter_base = "https://openrouter.ai/api/v1"
        self.memory_service = MemoryService()
    
    async def get_completion(
        self,
        agent_id: str,
        messages: List[Dict[str, str]],
        agent_config: Agent,
        chat_id: Optional[str] = None,
        memory_size: str = "Medium",
        capsule_id: Optional[str] = None
    ) -> LLMResponse:
        """
        Get completion from LLM based on agent configuration
        
        Args:
            agent_id: Agent identifier
            messages: List of message dicts with 'role' and 'content'
            agent_config: Agent configuration
            chat_id: Optional chat ID for memory retrieval
            memory_size: Memory size setting ('Small', 'Medium', 'Large')
            capsule_id: Optional capsule ID for memory scope isolation
        
        Returns:
            LLMResponse with content, model, usage, and metadata
        """
        # 1. Retrieve relevant memories if chat_id is provided (scoped by capsule)
        memory_context = ""
        if chat_id and self.memory_service._is_available():
            try:
                # Get the user's message for memory search
                user_message = messages[-1]["content"] if messages else ""
                
                # Retrieve relevant memories (filtered by capsule scope if provided)
                memories = self.memory_service.get_chat_memories(
                    agent_id=agent_id,
                    chat_id=chat_id,
                    query=user_message,
                    memory_size=memory_size,
                    capsule_id=capsule_id
                )
                
                # Format memory context
                memory_context = self.memory_service.format_memory_context(memories)
                
                if memory_context:
                    scope_info = f" (capsule: {capsule_id})" if capsule_id else ""
                    logger.debug(f"Retrieved {len(memories)} memories for chat {chat_id}{scope_info}")
            except Exception as e:
                logger.warning(f"Memory retrieval failed: {e}, continuing without memory")
        
        # 2. Build enhanced system prompt with memory context
        system_prompt = "You are a helpful assistant."
        if memory_context:
            system_prompt += f"\n\nRelevant context from previous conversations:\n{memory_context}"
        
        # 3. Add system prompt to messages if not already present
        enhanced_messages = messages.copy()
        if not any(msg.get("role") == "system" for msg in enhanced_messages):
            enhanced_messages.insert(0, {"role": "system", "content": system_prompt})
        else:
            # Update existing system message
            for msg in enhanced_messages:
                if msg.get("role") == "system":
                    if memory_context:
                        msg["content"] = f"{msg['content']}\n\nRelevant context from previous conversations:\n{memory_context}"
                    break
        
        # 4. Call LLM
        platform = agent_config.platform.lower()
        api_key = agent_config.api_key  # Get API key from agent config
        
        # Check for OpenRouter
        if "openrouter" in platform or platform == "openrouter":
            response = await self._openrouter_completion(enhanced_messages, agent_config.model, api_key)
        elif "openai" in platform or agent_id == "gpt":
            response = await self._openai_completion(enhanced_messages, agent_config.model, api_key)
        elif "anthropic" in platform or agent_id == "claude":
            response = await self._anthropic_completion(enhanced_messages, agent_config.model, api_key)
        elif "mistral" in platform or agent_id == "mistral":
            response = await self._mistral_completion(enhanced_messages, agent_config.model, api_key)
        else:
            # Default to OpenAI-compatible API (OpenRouter)
            response = await self._openrouter_completion(enhanced_messages, agent_config.model, api_key)
        
        # 5. Store new memory after successful response (scoped by capsule)
        if chat_id and self.memory_service._is_available() and response:
            try:
                # Prepare messages for memory storage (include assistant response)
                memory_messages = messages + [
                    {"role": "assistant", "content": response.content}
                ]
                
                # Store memory (mem0 decides what's worth storing, scoped by capsule)
                self.memory_service.store_chat_memory(
                    agent_id=agent_id,
                    chat_id=chat_id,
                    messages=memory_messages,
                    capsule_id=capsule_id
                )
            except Exception as e:
                logger.warning(f"Memory storage failed: {e}, response still returned")
        
        return response
    
    async def _openrouter_completion(self, messages: List[Dict[str, str]], model: Optional[str] = None, api_key: Optional[str] = None) -> LLMResponse:
        """OpenRouter.ai API completion"""
        model = model or "openai/gpt-4-turbo"
        api_key = api_key or settings.OPENAI_API_KEY  # Fallback to env key
        
        if not api_key:
            raise Exception("API key required for OpenRouter. Please configure your API key.")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.openrouter_base}/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://solmind.ai",  # Optional: for analytics
                    "X-Title": "SolMind"  # Optional: for analytics
                },
                json={
                    "model": model,
                    "messages": messages,
                    "temperature": 0.7
                },
                timeout=60.0
            )
            
            if response.status_code != 200:
                error_text = response.text
                raise Exception(f"OpenRouter API error ({response.status_code}): {error_text}")
            
            data = response.json()
            return LLMResponse(
                content=data["choices"][0]["message"]["content"],
                model=data.get("model", model),
                usage=data.get("usage"),
                metadata={
                    "finish_reason": data["choices"][0].get("finish_reason"),
                    "provider": data.get("model", "").split("/")[0] if "/" in data.get("model", "") else "openrouter"
                }
            )
    
    async def _openai_completion(self, messages: List[Dict[str, str]], model: Optional[str] = None, api_key: Optional[str] = None) -> LLMResponse:
        """OpenAI API completion"""
        model = model or "gpt-4-turbo-preview"
        api_key = api_key or settings.OPENAI_API_KEY
        
        if not api_key:
            raise Exception("API key required for OpenAI. Please configure your API key.")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.openai_base}/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": model,
                    "messages": messages,
                    "temperature": 0.7
                },
                timeout=30.0
            )
            
            if response.status_code != 200:
                raise Exception(f"OpenAI API error: {response.text}")
            
            data = response.json()
            return LLMResponse(
                content=data["choices"][0]["message"]["content"],
                model=model,
                usage=data.get("usage"),
                metadata={"finish_reason": data["choices"][0].get("finish_reason")}
            )
    
    async def _anthropic_completion(self, messages: List[Dict[str, str]], model: Optional[str] = None, api_key: Optional[str] = None) -> LLMResponse:
        """Anthropic Claude API completion"""
        model = model or "claude-3-5-sonnet-20241022"
        api_key = api_key or settings.ANTHROPIC_API_KEY
        
        if not api_key:
            raise Exception("API key required for Anthropic. Please configure your API key.")
        
        # Convert messages format for Anthropic
        system_message = None
        conversation_messages = []
        for msg in messages:
            if msg["role"] == "system":
                system_message = msg["content"]
            else:
                conversation_messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
        
        async with httpx.AsyncClient() as client:
            payload = {
                "model": model,
                "max_tokens": 4096,
                "messages": conversation_messages
            }
            if system_message:
                payload["system"] = system_message
            
            response = await client.post(
                f"{self.anthropic_base}/messages",
                headers={
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                    "Content-Type": "application/json"
                },
                json=payload,
                timeout=30.0
            )
            
            if response.status_code != 200:
                raise Exception(f"Anthropic API error: {response.text}")
            
            data = response.json()
            return LLMResponse(
                content=data["content"][0]["text"],
                model=model,
                usage=data.get("usage"),
                metadata={"stop_reason": data.get("stop_reason")}
            )
    
    async def _mistral_completion(self, messages: List[Dict[str, str]], model: Optional[str] = None, api_key: Optional[str] = None) -> LLMResponse:
        """Mistral AI API completion"""
        model = model or "mistral-large-latest"
        api_key = api_key or settings.MISTRAL_API_KEY
        
        if not api_key:
            raise Exception("API key required for Mistral. Please configure your API key.")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.mistral_base}/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": model,
                    "messages": messages,
                    "temperature": 0.7
                },
                timeout=30.0
            )
            
            if response.status_code != 200:
                raise Exception(f"Mistral API error: {response.text}")
            
            data = response.json()
            return LLMResponse(
                content=data["choices"][0]["message"]["content"],
                model=model,
                usage=data.get("usage"),
                metadata={"finish_reason": data["choices"][0].get("finish_reason")}
            )

