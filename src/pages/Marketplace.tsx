import { useState } from 'react';
import { Search, Star, TrendingUp, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MarketplaceCapsule {
  id: string;
  name: string;
  category: string;
  creator: string;
  reputation: number;
  stakeAmount: number;
  price: number;
  description: string;
  queries: number;
  rating: number;
}

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Popular');

  const categories = ['All', 'Finance', 'Gaming', 'Health', 'Technology', 'Education'];
  const sortOptions = ['Popular', 'Newest', 'Price: Low to High', 'Price: High to Low', 'Highest Rated'];

  const capsules: MarketplaceCapsule[] = [
    {
      id: '1',
      name: 'DeFi Yield Farming Expert',
      category: 'Finance',
      creator: 'CryptoWizard',
      reputation: 98,
      stakeAmount: 1200,
      price: 0.05,
      description: 'Advanced yield farming strategies across multiple protocols with real-time risk assessment.',
      queries: 1547,
      rating: 4.9
    },
    {
      id: '2',
      name: 'Pokemon Competitive Master',
      category: 'Gaming',
      creator: 'PokeMaster',
      reputation: 92,
      stakeAmount: 800,
      price: 0.02,
      description: 'Comprehensive Pokemon battle strategies and team building for competitive play.',
      queries: 2341,
      rating: 4.8
    },
    {
      id: '3',
      name: 'Nutrition & Meal Planning AI',
      category: 'Health',
      creator: 'HealthGuru',
      reputation: 95,
      stakeAmount: 950,
      price: 0.03,
      description: 'Personalized nutrition advice and meal planning based on dietary preferences and goals.',
      queries: 892,
      rating: 4.7
    },
    {
      id: '4',
      name: 'Smart Contract Auditor',
      category: 'Technology',
      creator: 'BlockchainDev',
      reputation: 99,
      stakeAmount: 2100,
      price: 0.08,
      description: 'Automated smart contract analysis and vulnerability detection for DeFi protocols.',
      queries: 723,
      rating: 5.0
    }
  ];

  const filteredCapsules = capsules.filter(capsule => {
    const matchesSearch = capsule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         capsule.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || capsule.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Marketplace</h1>
          <p className="text-gray-400">Discover and access AI memory capsules from the community</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search capsules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              {sortOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Capsule Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCapsules.map((capsule) => (
            <div key={capsule.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{capsule.name}</h3>
                  <p className="text-sm text-blue-400">{capsule.category}</p>
                </div>
                <div className="flex items-center space-x-1 text-yellow-400">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-medium">{capsule.rating}</span>
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4 line-clamp-3">{capsule.description}</p>

              <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <span>by {capsule.creator}</span>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>{capsule.reputation}%</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
                <div className="bg-gray-700 rounded p-2 text-center">
                  <div className="text-green-400 font-semibold">{capsule.stakeAmount}</div>
                  <div className="text-gray-400">MNT Staked</div>
                </div>
                <div className="bg-gray-700 rounded p-2 text-center">
                  <div className="text-blue-400 font-semibold">{capsule.queries}</div>
                  <div className="text-gray-400">Queries</div>
                </div>
                <div className="bg-gray-700 rounded p-2 text-center">
                  <div className="text-purple-400 font-semibold">{capsule.price}</div>
                  <div className="text-gray-400">MNT/query</div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Link 
                  to={`/app/marketplace/${capsule.id}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors text-center flex items-center justify-center"
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Buy
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredCapsules.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">No capsules found matching your criteria</div>
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;