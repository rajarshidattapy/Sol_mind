import { useWallet } from '@solana/wallet-adapter-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export class ApiClient {
  private baseUrl: string;
  private getWalletAddress: () => string | null;

  constructor(getWalletAddress: () => string | null) {
    this.baseUrl = API_BASE_URL;
    this.getWalletAddress = getWalletAddress;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const walletAddress = this.getWalletAddress();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (walletAddress) {
      headers['X-Wallet-Address'] = walletAddress;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Agents
  async getAgents() {
    return this.request('/api/v1/agents/');
  }

  async createAgent(agent: {
    name: string;
    display_name: string;
    platform: string;
    api_key: string;
    model?: string;
  }) {
    return this.request('/api/v1/agents/', {
      method: 'POST',
      body: JSON.stringify(agent),
    });
  }

  // Chats
  async getChats(agentId: string) {
    return this.request(`/api/v1/agents/${agentId}/chats`);
  }

  async createChat(agentId: string, chat: { name: string; memory_size?: string }) {
    return this.request(`/api/v1/agents/${agentId}/chats`, {
      method: 'POST',
      body: JSON.stringify(chat),
    });
  }

  async getChat(agentId: string, chatId: string) {
    return this.request(`/api/v1/agents/${agentId}/chats/${chatId}`);
  }

  async sendMessage(agentId: string, chatId: string, message: { role: string; content: string }) {
    return this.request(`/api/v1/agents/${agentId}/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  async getMessages(agentId: string, chatId: string) {
    return this.request(`/api/v1/agents/${agentId}/chats/${chatId}/messages`);
  }

  async deleteChat(agentId: string, chatId: string) {
    return this.request(`/api/v1/agents/${agentId}/chats/${chatId}`, {
      method: 'DELETE',
    });
  }

  // Capsules
  async getCapsules() {
    return this.request('/api/v1/capsules/');
  }

  async createCapsule(capsule: {
    name: string;
    description: string;
    category: string;
    price_per_query: number;
    metadata?: Record<string, any>;
  }) {
    return this.request('/api/v1/capsules/', {
      method: 'POST',
      body: JSON.stringify(capsule),
    });
  }

  async getCapsule(capsuleId: string) {
    return this.request(`/api/v1/capsules/${capsuleId}`);
  }

  // Marketplace
  async browseMarketplace(filters?: {
    category?: string;
    min_reputation?: number;
    max_price?: number;
    sort_by?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const query = params.toString();
    return this.request(`/api/v1/marketplace/${query ? `?${query}` : ''}`);
  }

  async getTrending(limit = 10) {
    return this.request(`/api/v1/marketplace/trending?limit=${limit}`);
  }

  async searchCapsules(query: string, limit = 20) {
    return this.request(`/api/v1/marketplace/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  }

  // Wallet
  async getBalance() {
    return this.request('/api/v1/wallet/balance');
  }

  async getEarnings(period?: string) {
    const query = period ? `?period=${period}` : '';
    return this.request(`/api/v1/wallet/earnings${query}`);
  }

  async getStakingInfo() {
    return this.request('/api/v1/wallet/staking');
  }

  async createStaking(staking: { capsule_id: string; stake_amount: number }) {
    return this.request('/api/v1/wallet/staking', {
      method: 'POST',
      body: JSON.stringify(staking),
    });
  }
}

// Hook to use API client
export function useApiClient() {
  const { publicKey } = useWallet();
  
  const getWalletAddress = () => {
    return publicKey?.toBase58() || null;
  };

  return new ApiClient(getWalletAddress);
}

