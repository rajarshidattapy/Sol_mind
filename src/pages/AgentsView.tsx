import { useState } from 'react';
import { MessageSquare, Plus, Brain, Clock, Sparkles } from 'lucide-react';
import AgentChat from './AgentChat';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Chat {
  id: string;
  name: string;
  memorySize: 'Small' | 'Medium' | 'Large';
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
  messages: Message[];
}

interface LLMConfig {
  id: string;
  name: string;
  displayName: string;
  platform: string;
  apiKeyConfigured: boolean;
}

interface AgentsViewProps {
  activeModel: string;
  customLLMs: LLMConfig[];
  onAddLLM: (llm: LLMConfig) => void;
}

const AgentsView: React.FC<AgentsViewProps> = ({ activeModel, customLLMs, onAddLLM }) => {
  const [activeView, setActiveView] = useState<'list' | 'chat'>('list');
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>(undefined);
  const [allChats, setAllChats] = useState<Record<string, Chat[]>>({
    claude: [
      {
        id: '1',
        name: 'Trading Strategy Chat',
        memorySize: 'Large',
        lastMessage: 'What are the key technical indicators for crypto trading?',
        timestamp: new Date(Date.now() - 1800000),
        messageCount: 2,
        messages: [
          {
            id: '1',
            role: 'user',
            content: 'What are the key technical indicators for crypto trading?',
            timestamp: new Date(Date.now() - 60000)
          },
          {
            id: '2',
            role: 'assistant',
            content: 'Based on my understanding of crypto markets, here are the most effective technical indicators:\n\n1. **RSI (Relative Strength Index)** - Helps identify overbought/oversold conditions\n2. **MACD** - Shows momentum and trend direction\n3. **Bollinger Bands** - Indicates volatility and potential price breakouts\n4. **Volume** - Confirms price movements\n5. **Moving Averages** - Identifies trend direction',
            timestamp: new Date(Date.now() - 30000)
          }
        ]
      },
      {
        id: '2',
        name: 'Content Writing Assistant',
        memorySize: 'Medium',
        lastMessage: 'Help me write a blog post about AI trends',
        timestamp: new Date(Date.now() - 3600000),
        messageCount: 23,
        messages: []
      }
    ],
    gpt: [
      {
        id: '3',
        name: 'Code Review Helper',
        memorySize: 'Large',
        lastMessage: 'Review this React component for best practices',
        timestamp: new Date(Date.now() - 7200000),
        messageCount: 89,
        messages: []
      },
      {
        id: '4',
        name: 'Business Strategy',
        memorySize: 'Medium',
        lastMessage: 'Analyze market opportunities for SaaS',
        timestamp: new Date(Date.now() - 14400000),
        messageCount: 31,
        messages: []
      }
    ],
    mistral: [
      {
        id: '5',
        name: 'Language Learning',
        memorySize: 'Small',
        lastMessage: 'Practice French conversation',
        timestamp: new Date(Date.now() - 86400000),
        messageCount: 15,
        messages: []
      }
    ]
  });

  // Add custom LLM chats
  customLLMs.forEach(llm => {
    if (!allChats[llm.name]) {
      setAllChats(prev => ({ ...prev, [llm.name]: [] }));
    }
  });

  const currentChats = allChats[activeModel] || [];
  const selectedChat = selectedChatId ? currentChats.find(c => c.id === selectedChatId) : undefined;

  const getMemoryColor = (size: string) => {
    switch (size) {
      case 'Small': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'Large': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getModelDisplayName = (model: string) => {
    const customLLM = customLLMs.find(llm => llm.name === model);
    if (customLLM) return customLLM.displayName;
    
    switch (model) {
      case 'claude': return 'Claude 3.5 Sonnet';
      case 'gpt': return 'GPT-4 Turbo';
      case 'mistral': return 'Mistral Large';
      default: return model;
    }
  };

  const handleContinueChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setActiveView('chat');
  };

  const handleNewChat = () => {
    // Create a new chat entry
    const newChatId = `new-${Date.now()}`;
    const newChat: Chat = {
      id: newChatId,
      name: 'New Chat',
      memorySize: 'Small',
      lastMessage: '',
      timestamp: new Date(),
      messageCount: 0,
      messages: []
    };
    
    setAllChats(prev => ({
      ...prev,
      [activeModel]: [newChat, ...(prev[activeModel] || [])]
    }));
    
    setSelectedChatId(newChatId);
    setActiveView('chat');
  };

  const handleBackToList = () => {
    setActiveView('list');
  };

  const handleUpdateMessages = (chatId: string, messages: Message[]) => {
    setAllChats(prev => ({
      ...prev,
      [activeModel]: (prev[activeModel] || []).map(chat => {
        if (chat.id === chatId) {
          const lastMsg = messages[messages.length - 1];
          return {
            ...chat,
            messages,
            messageCount: messages.length,
            lastMessage: lastMsg?.content.substring(0, 100) || '',
            timestamp: lastMsg?.timestamp || chat.timestamp,
            name: messages.length > 0 && chat.name === 'New Chat' 
              ? messages[0].content.substring(0, 30) + '...'
              : chat.name
          };
        }
        return chat;
      })
    }));
  };

  if (activeView === 'chat' && selectedChatId) {
    return (
      <AgentChat 
        activeModel={activeModel}
        chatId={selectedChatId}
        initialMessages={selectedChat?.messages || []}
        onBack={handleBackToList}
        onUpdateMessages={(messages) => handleUpdateMessages(selectedChatId, messages)}
        customLLMs={customLLMs}
        onAddLLM={onAddLLM}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {getModelDisplayName(activeModel)} Chats
            </h1>
            <p className="text-gray-400">
              Manage your conversations and memory capsules for {getModelDisplayName(activeModel)}
            </p>
          </div>
          
          <button 
            onClick={handleNewChat}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Chat
          </button>
        </div>

        {currentChats.length === 0 ? (
          <div className="text-center py-20">
            <Brain className="h-16 w-16 mx-auto mb-6 text-gray-600" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No chats with {getModelDisplayName(activeModel)} yet
            </h3>
            <p className="text-gray-400 mb-6">
              Start your first conversation to begin building memory capsules
            </p>
            <button 
              onClick={handleNewChat}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Start First Chat
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentChats.map((chat) => (
              <div
                key={chat.id}
                className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-blue-400" />
                    <h3 className="font-semibold text-white">{chat.name}</h3>
                  </div>
                  <div className={`text-xs font-medium ${getMemoryColor(chat.memorySize)}`}>
                    {chat.memorySize}
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {chat.lastMessage}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{chat.timestamp.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Sparkles className="h-3 w-3" />
                    <span>{chat.messageCount} messages</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleContinueChat(chat.id)}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded text-sm transition-colors"
                    >
                      Continue Chat
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm transition-colors">
                      View Capsule
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentsView;
