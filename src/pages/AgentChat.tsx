import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ArrowLeft, Sparkles, Settings, X } from 'lucide-react';
import { useApiClient } from '../lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date | string;
}

interface LLMConfig {
  id: string;
  name: string;
  displayName: string;
  platform: string;
  apiKeyConfigured: boolean;
}

interface AgentChatProps {
  activeModel: string;
  chatId?: string;
  initialMessages: Message[];
  onBack: () => void;
  onUpdateMessages: (messages: Message[]) => void;
  onUpdateChatId?: (oldId: string, newId: string) => void;
  customLLMs: LLMConfig[];
  onAddLLM: (llm: LLMConfig) => void;
}

const AgentChat: React.FC<AgentChatProps> = ({ 
  activeModel, 
  chatId,
  initialMessages,
  onBack,
  onUpdateMessages,
  onUpdateChatId,
  customLLMs,
  onAddLLM
}) => {
  const api = useApiClient();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddLLM, setShowAddLLM] = useState(false);
  const [newLLMName, setNewLLMName] = useState('');
  const [newLLMPlatform, setNewLLMPlatform] = useState('');
  const [newLLMApiKey, setNewLLMApiKey] = useState('');
  const [actualChatId, setActualChatId] = useState<string | undefined>(chatId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update actualChatId when chatId prop changes
  useEffect(() => {
    setActualChatId(chatId);
  }, [chatId]);

  const allLLMs: LLMConfig[] = [
    { id: 'claude', name: 'claude', displayName: 'Claude 3.5 Sonnet', platform: 'Anthropic', apiKeyConfigured: true },
    { id: 'gpt', name: 'gpt', displayName: 'GPT-4 Turbo', platform: 'OpenAI', apiKeyConfigured: true },
    { id: 'mistral', name: 'mistral', displayName: 'Mistral Large', platform: 'Mistral AI', apiKeyConfigured: true },
    ...customLLMs
  ];

  // Better matching: try by id, name, displayName, or case-insensitive match
  const currentLLM = allLLMs.find(llm => 
    llm.id === activeModel || 
    llm.name === activeModel || 
    llm.displayName === activeModel ||
    llm.id.toLowerCase() === activeModel.toLowerCase() ||
    llm.name.toLowerCase() === activeModel.toLowerCase() ||
    llm.displayName.toLowerCase() === activeModel.toLowerCase()
  ) || allLLMs[0]; // Default to first (Claude) only if no match found

  // Load messages from API when chatId is available and not a new chat
  useEffect(() => {
    const loadMessages = async () => {
      if (!actualChatId || actualChatId.startsWith('new-') || messages.length > 0) {
        return; // Skip if new chat or messages already loaded
      }

      try {
        const apiMessages = await api.getMessages(currentLLM.id, actualChatId) as any[];
        const transformedMessages: Message[] = apiMessages.map((msg: any) => ({
          id: msg.id || Date.now().toString(),
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
        }));
        
        if (transformedMessages.length > 0) {
          setMessages(transformedMessages);
          onUpdateMessages(transformedMessages);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        // Continue with empty messages if load fails
      }
    };

    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actualChatId, currentLLM.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !chatId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Ensure agent exists - create if it's a temporary custom LLM
      let agentId = currentLLM.id;
      console.log('Selected agent:', { agentId, activeModel, currentLLM: currentLLM.displayName });
      
      // Check if this is a temporary agent that needs to be created
      // Or if it's a custom agent that might not exist yet
      const isTemporaryAgent = agentId.startsWith('custom-');
      const hasApiKey = (currentLLM as any).apiKey;
      
      if (isTemporaryAgent && hasApiKey) {
        // This is a temporary agent that needs to be created
        const agentName = currentLLM.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '-');
        try {
          const createdAgent = await api.createAgent({
            name: agentName,
            display_name: currentLLM.displayName, // API expects display_name
            platform: currentLLM.platform,
            api_key: (currentLLM as any).apiKey,
            model: (currentLLM as any).model || currentLLM.displayName
          }) as any;
          
          agentId = createdAgent.id;
          console.log('Created new agent:', agentId);
          // Update the LLM config with the real ID
          currentLLM.id = agentId;
          delete (currentLLM as any).apiKey; // Remove API key from memory
        } catch (err) {
          console.error('Error creating agent:', err);
          throw new Error(`Failed to create agent: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      // Ensure chat exists - create if it's a temporary chat (starts with "new-")
      let currentChatId = actualChatId || chatId;
      if (!currentChatId || currentChatId.startsWith('new-')) {
        // Create chat via API with the correct agentId
        console.log('Creating new chat for agent:', agentId);
        try {
          const createdChat = await api.createChat(agentId, {
            name: 'New Chat',
            memory_size: 'Small'
          }) as any;
          currentChatId = createdChat.id;
          console.log('Created chat:', currentChatId, 'for agent:', agentId);
          
          // Update local state
          setActualChatId(currentChatId);
          
          // Update chat ID in parent component
          if (onUpdateChatId && chatId) {
            onUpdateChatId(chatId, currentChatId);
          }
        } catch (err) {
          console.error('Error creating chat:', err);
          throw new Error(`Failed to create chat: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }
      
      console.log('Sending message to agent:', agentId, 'chat:', currentChatId);

      // Add user message to UI immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: currentMessage,
        timestamp: new Date()
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setCurrentMessage('');

      // Use agent ID (not name) for API calls
      // Send message to backend API
      const response = await api.sendMessage(agentId, currentChatId, {
        role: 'user',
        content: currentMessage
      }) as { content: string };

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date()
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      onUpdateMessages(updatedMessages);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Revert user message on error
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLLM = async () => {
    if (!newLLMName.trim() || !newLLMPlatform.trim() || !newLLMApiKey.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      // Create agent via API
      const agentName = newLLMName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '-');
      const agent = await api.createAgent({
        name: agentName,
        display_name: newLLMName,
        platform: newLLMPlatform,
        api_key: newLLMApiKey,
        model: newLLMName // Use full model name (e.g., nvidia/nemotron-nano-12b-v2-vl:free)
      }) as any; // API returns snake_case, not camelCase

      const newLLM: LLMConfig = {
        id: agent.id,
        name: agent.name,
        displayName: agent.display_name || newLLMName,
        platform: agent.platform,
        apiKeyConfigured: true
      };

      onAddLLM(newLLM);
      setNewLLMName('');
      setNewLLMPlatform('');
      setNewLLMApiKey('');
      setShowAddLLM(false);
    } catch (err) {
      console.error('Error creating agent:', err);
      setError(err instanceof Error ? err.message : 'Failed to create agent');
    } finally {
      setIsLoading(false);
    }
  };

  const platforms = [
    'OpenAI',
    'Anthropic',
    'Google AI',
    'Mistral AI',
    'Cohere',
    'Hugging Face',
    'Replicate',
    'Together AI',
    'Groq',
    'Perplexity',
    'Fireworks AI',
    'Other'
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-white">
                {messages.length === 0 ? 'New Chat' : 'Chat'}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-gray-700 px-3 py-2 rounded-lg">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm text-gray-300">{currentLLM.displayName}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="text-center py-20">
            <Bot className="h-16 w-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold text-white mb-2">Start a conversation</h3>
            <p className="text-gray-400 mb-8">
              Chat with {currentLLM.displayName} to build intelligence in your memory capsule
            </p>
            <div className="max-w-md mx-auto space-y-2">
              {[
                'What are the best strategies for...',
                'Help me understand...',
                'Analyze this situation...'
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentMessage(suggestion)}
                  className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 text-sm transition-colors border border-gray-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex space-x-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                message.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'
              }`}>
                {message.role === 'user' ? 
                  <User className="h-5 w-5 text-white" /> : 
                  <Bot className="h-5 w-5 text-white" />
                }
              </div>
              
              <div className={`rounded-lg px-4 py-3 ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-100 border border-gray-700'
              }`}>
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.role === 'assistant' && (
                  <div className="text-xs text-green-400 mt-3 flex items-center">
                    <Sparkles className="h-3 w-3 mr-1" />
                    + Memory stored
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex space-x-3 max-w-3xl">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-700 shrink-0">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-6 py-2 bg-red-900/20 border-t border-red-800">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-700 p-4 bg-gray-800">
        <div className="flex space-x-4 max-w-4xl mx-auto">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder={`Message ${currentLLM.displayName}...`}
            className="flex-1 bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Add LLM Modal */}
      {showAddLLM && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">Add New LLM</h2>
              </div>
              <button 
                onClick={() => setShowAddLLM(false)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Model Name
                </label>
                <input
                  type="text"
                  value={newLLMName}
                  onChange={(e) => setNewLLMName(e.target.value)}
                  placeholder="e.g., GPT-4o, Gemini Pro, Llama 3"
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Platform / Provider
                </label>
                <select
                  value={newLLMPlatform}
                  onChange={(e) => setNewLLMPlatform(e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select a platform</option>
                  {platforms.map(platform => (
                    <option key={platform} value={platform}>{platform}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={newLLMApiKey}
                  onChange={(e) => setNewLLMApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Your API key is stored securely and never shared.
                </p>
              </div>

              <div className="bg-blue-600 bg-opacity-10 border border-blue-500 rounded-lg p-4">
                <h4 className="text-blue-400 font-medium mb-2">Supported Platforms</h4>
                <p className="text-sm text-gray-300">
                  We support any OpenAI-compatible API endpoint. Enter your provider's API key to get started.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowAddLLM(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLLM}
                  disabled={!newLLMName.trim() || !newLLMPlatform || !newLLMApiKey.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Add LLM
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentChat;
