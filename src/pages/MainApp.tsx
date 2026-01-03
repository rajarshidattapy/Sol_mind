import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AgentsView from './AgentsView';
import MarketplaceView from './MarketplaceView';
import WalletView from './WalletView';
import Settings from './Settings';
import { useApiClient } from '../lib/api';

interface LLMConfig {
  id: string;
  name: string;
  displayName: string;
  platform: string;
  apiKeyConfigured: boolean;
}

// Default agent IDs that should not be loaded as custom LLMs
const DEFAULT_AGENT_IDS = ['claude', 'gpt', 'mistral'];

const MainApp = () => {
  const [activeTab, setActiveTab] = useState('agents');
  const [activeSubTab, setActiveSubTab] = useState('claude');
  const [customLLMs, setCustomLLMs] = useState<LLMConfig[]>([]);
  const api = useApiClient();

  // Load custom agents from backend on mount
  useEffect(() => {
    const loadCustomAgents = async () => {
      try {
        const agents = await api.getAgents() as any[];
        
        // Filter out default agents and convert to LLMConfig format
        const customAgents: LLMConfig[] = agents
          .filter(agent => !DEFAULT_AGENT_IDS.includes(agent.id))
          .map(agent => ({
            id: agent.id,
            name: agent.name,
            displayName: agent.display_name || agent.name,
            platform: agent.platform,
            apiKeyConfigured: agent.api_key_configured || false
          }));
        
        setCustomLLMs(customAgents);
        console.log(`Loaded ${customAgents.length} custom agents from backend`);
      } catch (error) {
        console.error('Error loading custom agents:', error);
        // Continue with empty list if API fails
      }
    };

    loadCustomAgents();
  }, []); // Only run on mount

  const handleAddLLM = (llm: LLMConfig) => {
    setCustomLLMs(prev => [...prev, llm]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'agents':
        return (
          <AgentsView 
            activeModel={activeSubTab} 
            customLLMs={customLLMs}
            onAddLLM={handleAddLLM}
          />
        );
      case 'marketplace':
        return <MarketplaceView activeSubTab={activeSubTab} />;
      case 'wallet':
        return <WalletView activeSubTab={activeSubTab} />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <AgentsView 
            activeModel="claude" 
            customLLMs={customLLMs}
            onAddLLM={handleAddLLM}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
        customLLMs={customLLMs}
        onAddLLM={handleAddLLM}
      />
      <main>
        {renderContent()}
      </main>
    </div>
  );
};

export default MainApp;
