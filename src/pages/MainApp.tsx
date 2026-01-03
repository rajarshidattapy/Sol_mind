import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import AgentsView from './AgentsView';
import MarketplaceView from './MarketplaceView';
import WalletView from './WalletView';
import Settings from './Settings';
import { useApiClient } from '../lib/api';
import { useWallet } from '@solana/wallet-adapter-react';

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
  const { publicKey, connected } = useWallet();
  const preferencesLoadedRef = useRef(false);

  // Load preferences from Redis (Vercel KV) on mount (only once)
  useEffect(() => {
    if (preferencesLoadedRef.current) return; // Only load once
    if (!connected || !publicKey) return; // Need wallet to load preferences
    
    const loadPreferences = async () => {
      try {
        const prefs = await api.getPreferences();
        if (prefs.active_tab) {
          setActiveTab(prefs.active_tab);
        }
        if (prefs.active_sub_tab) {
          setActiveSubTab(prefs.active_sub_tab);
        }
        preferencesLoadedRef.current = true;
      } catch (error) {
        console.error('Error loading preferences:', error);
        preferencesLoadedRef.current = true; // Mark as loaded even on error to prevent retries
      }
    };

    loadPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, publicKey]); // api is stable, doesn't need to be in deps

  // Save preferences to Redis when they change
  useEffect(() => {
    const savePreferences = async () => {
      if (!connected || !publicKey) return; // Need wallet to save preferences
      
      try {
        await api.updatePreferences({
          active_tab: activeTab,
          active_sub_tab: activeSubTab
        });
      } catch (error) {
        console.error('Error saving preferences:', error);
        // Fail silently - preferences are not critical
      }
    };

    // Debounce saves to avoid too many API calls
    const timeoutId = setTimeout(savePreferences, 500);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, activeSubTab, connected, publicKey?.toBase58()]); // api is stable, doesn't need to be in deps

  // Load custom agents from backend when wallet is connected
  useEffect(() => {
    const loadCustomAgents = async () => {
      // Only load if wallet is connected (needed for filtering user's agents)
      if (!connected || !publicKey) {
        setCustomLLMs([]);
        return;
      }
      
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
        setCustomLLMs([]);
      }
    };

    loadCustomAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, publicKey?.toBase58()]); // Reload when wallet connects/disconnects (api is stable)

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
