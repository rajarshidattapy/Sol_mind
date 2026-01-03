import { TrendingUp, Shield, Star, Coins, Plus, Minus } from 'lucide-react';

const Staking = () => {

  const myCapsules = [
    {
      id: '1',
      name: 'Pokemon Strategy Master',
      currentStake: 150,
      ranking: 8,
      visibility: 'High',
      earnings: 2.4
    },
    {
      id: '2',
      name: 'Crypto Trading Intelligence',
      currentStake: 50,
      ranking: 23,
      visibility: 'Medium',
      earnings: 0.8
    }
  ];

  const stakingOpportunities = [
    {
      id: '1',
      name: 'DeFi Yield Farming Expert',
      creator: 'CryptoWizard',
      totalStaked: 1200,
      apy: 24.5,
      minStake: 10,
      queries: 1547,
      rating: 4.9
    },
    {
      id: '2',
      name: 'Smart Contract Auditor',
      creator: 'BlockchainDev',
      totalStaked: 2100,
      apy: 18.2,
      minStake: 25,
      queries: 723,
      rating: 5.0
    },
    {
      id: '3',
      name: 'Nutrition & Meal Planning AI',
      creator: 'HealthGuru',
      totalStaked: 950,
      apy: 31.7,
      minStake: 5,
      queries: 892,
      rating: 4.7
    }
  ];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Staking</h1>
          <p className="text-gray-400">Stake MNT tokens to boost visibility and earn rewards</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center space-x-2 mb-3">
              <Coins className="h-5 w-5 text-blue-400" />
              <span className="text-gray-400">Total Staked</span>
            </div>
            <div className="text-2xl font-bold text-white">200 MNT</div>
            <div className="text-sm text-green-400">+15 MNT this week</div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <span className="text-gray-400">Staking Rewards</span>
            </div>
            <div className="text-2xl font-bold text-white">3.2 MNT</div>
            <div className="text-sm text-gray-400">Last 30 days</div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="h-5 w-5 text-purple-400" />
              <span className="text-gray-400">Avg. APY</span>
            </div>
            <div className="text-2xl font-bold text-white">22.8%</div>
            <div className="text-sm text-purple-400">Across all stakes</div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center space-x-2 mb-3">
              <Star className="h-5 w-5 text-yellow-400" />
              <span className="text-gray-400">Active Stakes</span>
            </div>
            <div className="text-2xl font-bold text-white">5</div>
            <div className="text-sm text-gray-400">Across 3 capsules</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Capsules Staking */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">My Capsules</h2>
            
            <div className="space-y-4">
              {myCapsules.map((capsule) => (
                <div key={capsule.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{capsule.name}</h3>
                      <div className="text-sm text-gray-400">
                        Ranking: #{capsule.ranking} • Visibility: {capsule.visibility}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-semibold">+{capsule.earnings} MNT</div>
                      <div className="text-xs text-gray-400">This week</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-white">{capsule.currentStake} MNT</div>
                    <div className="flex space-x-2">
                      <button className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors">
                        <Minus className="h-4 w-4" />
                      </button>
                      <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded transition-colors">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-blue-400 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((capsule.currentStake / 200) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {capsule.currentStake} / 200 MNT for top 5 ranking
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-600 bg-opacity-10 border border-blue-500 rounded-lg">
              <h4 className="text-blue-400 font-semibold mb-2">Staking Benefits</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <div>• Higher stakes = better marketplace visibility</div>
                <div>• Earn portion of query fees from your capsules</div>
                <div>• Priority access during high-demand periods</div>
              </div>
            </div>
          </div>

          {/* Staking Opportunities */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Staking Opportunities</h2>
            
            <div className="space-y-4">
              {stakingOpportunities.map((opportunity) => (
                <div key={opportunity.id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{opportunity.name}</h3>
                      <div className="text-sm text-gray-400">by {opportunity.creator}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-semibold">{opportunity.apy}% APY</div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-400">{opportunity.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div>
                      <div className="text-gray-400">Total Staked</div>
                      <div className="text-white font-semibold">{opportunity.totalStaked} MNT</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Queries</div>
                      <div className="text-white font-semibold">{opportunity.queries}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Min Stake</div>
                      <div className="text-white font-semibold">{opportunity.minStake} MNT</div>
                    </div>
                  </div>

                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium transition-colors">
                    Stake Now
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-yellow-600 bg-opacity-10 border border-yellow-500 rounded-lg">
              <h4 className="text-yellow-400 font-semibold mb-2">Staking Rewards</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <div>• Get discounted queries on staked capsules</div>
                <div>• Priority access to new features</div>
                <div>• Early access to capsule updates</div>
                <div>• Governance voting on platform decisions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Staking;