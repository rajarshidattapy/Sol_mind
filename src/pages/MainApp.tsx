import { useState } from 'react';
import Navbar from '../components/Navbar';
import AgentsView from './AgentsView';
import MarketplaceView from './MarketplaceView';
import WalletView from './WalletView';
import Settings from './Settings';

interface LLMConfig {
  id: string;
  name: string;
  displayName: string;
  platform: string;
  apiKeyConfigured: boolean;
}

const MainApp = () => {
  const [activeTab, setActiveTab] = useState('agents');
  const [activeSubTab, setActiveSubTab] = useState('claude');
  const [customLLMs, setCustomLLMs] = useState<LLMConfig[]>([]);

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
