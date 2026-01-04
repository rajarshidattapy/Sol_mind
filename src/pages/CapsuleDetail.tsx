import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, User, TrendingUp, MessageSquare, Play } from 'lucide-react';

const CapsuleDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'trial' | 'reviews'>('overview');

  // Mock data for the capsule
  const capsule = {
    id,
    name: 'DeFi Yield Farming Expert',
    category: 'Finance',
    creator: 'CryptoWizard',
    reputation: 98,
    stakeAmount: 1200,
    price: 0.05,
    trialQueries: 3,
    description: 'Advanced yield farming strategies across multiple protocols with real-time risk assessment and opportunity identification.',
    fullDescription: 'This memory capsule has been trained through extensive conversations about DeFi yield farming, liquidity provision, and protocol analysis. It understands complex tokenomics, impermanent loss calculations, and can provide strategic guidance for optimizing yields while managing risk across various DeFi protocols.',
    knowledge: [
      'Multi-protocol yield optimization',
      'Impermanent loss calculation',
      'Risk assessment frameworks',
      'APY vs APR analysis',
      'Smart contract risk evaluation',
      'Liquidity mining strategies'
    ],
    queries: 1547,
    rating: 4.9,
    reviews: [
      {
        id: '1',
        user: 'DeFiTrader',
        rating: 5,
        comment: 'Incredibly detailed analysis of yield farming opportunities. Helped me optimize my portfolio across 3 protocols.',
        timestamp: '2 days ago'
      },
      {
        id: '2',
        user: 'CryptoNovice',
        rating: 4,
        comment: 'Great for understanding the basics of yield farming. Could use more beginner-friendly explanations.',
        timestamp: '1 week ago'
      }
    ]
  };

  const exampleQuestions = [
    "What are the best yield farming opportunities on Ethereum right now?",
    "How do I calculate impermanent loss for an ETH/USDC pool?",
    "What are the risks of providing liquidity to Curve pools?"
  ];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{capsule.name}</h1>
              <p className="text-blue-400 text-lg">{capsule.category}</p>
              <div className="flex items-center space-x-4 mt-3 text-gray-400">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>by {capsule.creator}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>{capsule.reputation}% reputation</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span>{capsule.rating} rating</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-white mb-1">{capsule.price} SOL</div>
              <div className="text-gray-400">per query</div>
              <div className="mt-4 space-x-3">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                  Subscribe
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center">
                  <Play className="h-4 w-4 mr-2" />
                  Try Free
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{capsule.stakeAmount}</div>
              <div className="text-sm text-gray-400">SOL Staked</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{capsule.queries}</div>
              <div className="text-sm text-gray-400">Total Queries</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{capsule.trialQueries}</div>
              <div className="text-sm text-gray-400">Free Trials</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{capsule.rating}</div>
              <div className="text-sm text-gray-400">Rating</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="border-b border-gray-700">
            <div className="flex">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'trial', label: 'Try It Out' },
                { id: 'reviews', label: 'Reviews' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-500 text-blue-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">About This Capsule</h3>
                  <p className="text-gray-300 leading-relaxed">{capsule.fullDescription}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">What This Capsule Knows</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {capsule.knowledge.map((item, index) => (
                      <div key={index} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                          <span className="text-white">{item}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'trial' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                    {capsule.trialQueries}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Free Trial Queries Available</h3>
                  <p className="text-gray-400">Try these example questions to see how this capsule works</p>
                </div>

                <div className="space-y-3">
                  {exampleQuestions.map((question, index) => (
                    <button
                      key={index}
                      className="w-full bg-gray-700 hover:bg-gray-600 text-left text-gray-300 p-4 rounded-lg transition-colors flex items-center justify-between"
                    >
                      <span>{question}</span>
                      <MessageSquare className="h-5 w-5 text-gray-500" />
                    </button>
                  ))}
                </div>

                <div className="bg-blue-600 bg-opacity-10 border border-blue-500 rounded-lg p-6 text-center">
                  <h4 className="text-blue-400 font-semibold mb-2">Custom Question</h4>
                  <input
                    type="text"
                    placeholder="Ask your own question..."
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none mb-4"
                  />
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                    Try Question
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">User Reviews</h3>
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="text-white font-semibold">{capsule.rating}</span>
                    <span className="text-gray-400">({capsule.reviews.length} reviews)</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {capsule.reviews.map((review) => (
                    <div key={review.id} className="bg-gray-700 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {review.user[0]}
                          </div>
                          <span className="text-white font-medium">{review.user}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-500'
                              }`}
                            />
                          ))}
                          <span className="text-gray-400 text-sm ml-2">{review.timestamp}</span>
                        </div>
                      </div>
                      <p className="text-gray-300">{review.comment}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-700 rounded-lg p-6">
                  <h4 className="text-white font-semibold mb-4">Leave a Review</h4>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">Rating:</span>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-gray-500 hover:text-yellow-400 cursor-pointer" />
                      ))}
                    </div>
                    <textarea
                      placeholder="Share your experience with this capsule..."
                      className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg border border-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                      rows={3}
                    />
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                      Submit Review
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapsuleDetail;