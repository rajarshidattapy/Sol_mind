import { useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
  const [defaultModel, setDefaultModel] = useState('claude-3.5-sonnet');
  const [memoryBehavior, setMemoryBehavior] = useState('adaptive');

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Customize your MantleMind experience</p>
        </div>

        <div className="space-y-8">
          {/* AI Model Settings */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <SettingsIcon className="h-5 w-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">AI Model Settings</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">
                  Default Model
                </label>
                <select
                  value={defaultModel}
                  onChange={(e) => setDefaultModel(e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Choose your preferred AI model for new conversations
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">
                  Memory Behavior
                </label>
                <select
                  value={memoryBehavior}
                  onChange={(e) => setMemoryBehavior(e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="adaptive">Adaptive - AI decides when to remember</option>
                  <option value="aggressive">Aggressive - Remember everything</option>
                  <option value="conservative">Conservative - Only remember important items</option>
                  <option value="manual">Manual - User controls memory</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Controls how actively the system builds memory from conversations
                </p>
              </div>
            </div>
          </div>
          {/* Save Button */}
          <div className="flex justify-end">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
