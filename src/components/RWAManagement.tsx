import { useState, useEffect } from 'react';
import { Plus, FileText, CheckCircle, Clock, XCircle, Landmark, Receipt, Gem, Home } from 'lucide-react';
import { getUserRWATokens, createRWAToken } from '../services/mockData';
import { RWAToken } from '../types';
import { formatCurrency } from '../utils/calculations';

interface RWAManagementProps {
  userId: string;
}

const tokenTypeIcons = {
  land: Landmark,
  invoice: Receipt,
  gold: Gem,
  property: Home,
};

export default function RWAManagement({ userId }: RWAManagementProps) {
  const [tokens, setTokens] = useState<RWAToken[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tokenType, setTokenType] = useState<RWAToken['tokenType']>('land');
  const [tokenName, setTokenName] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');

  useEffect(() => {
    loadTokens();
  }, [userId]);

  const loadTokens = () => {
    setTokens(getUserRWATokens(userId));
  };

  const handleCreate = () => {
    if (!tokenName || !description || !estimatedValue) return;

    try {
      createRWAToken(userId, tokenType, tokenName, description, parseFloat(estimatedValue));
      setTokenName('');
      setDescription('');
      setEstimatedValue('');
      setShowCreateModal(false);
      loadTokens();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create token');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Real World Assets (RWA)</h2>
          <p className="text-slate-400 text-sm mt-1">Tokenize real-world assets for use as collateral</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition font-medium"
        >
          <Plus className="w-5 h-5" />
          Create RWA Token
        </button>
      </div>

      {tokens.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <FileText className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No RWA Tokens Yet</h3>
          <p className="text-slate-400 mb-6">
            Create your first tokenized real-world asset to expand your borrowing options
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium"
          >
            Create First Token
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tokens.map((token) => {
            const Icon = tokenTypeIcons[token.tokenType];
            return (
              <div
                key={token.id}
                className="bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-xl p-6 hover:border-white/20 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {token.verificationStatus === 'verified' && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-green-400 font-medium">Verified</span>
                    </div>
                  )}
                  {token.verificationStatus === 'pending' && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-full">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs text-yellow-400 font-medium">Pending</span>
                    </div>
                  )}
                  {token.verificationStatus === 'rejected' && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 rounded-full">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span className="text-xs text-red-400 font-medium">Rejected</span>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{token.tokenName}</h3>
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{token.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Type</span>
                    <span className="text-white font-medium capitalize">{token.tokenType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Estimated Value</span>
                    <span className="text-white font-bold">${formatCurrency(token.estimatedValue, 0)}</span>
                  </div>
                </div>

                {token.verificationStatus === 'verified' && (
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-xs text-green-400">
                      This asset can be used as collateral for borrowing
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-lg w-full border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Create RWA Token</h3>

            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Asset Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(tokenTypeIcons) as Array<keyof typeof tokenTypeIcons>).map((type) => {
                  const Icon = tokenTypeIcons[type];
                  return (
                    <button
                      key={type}
                      onClick={() => setTokenType(type)}
                      className={`flex items-center gap-3 p-3 rounded-lg transition ${
                        tokenType === type
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium capitalize">{type}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Asset Name</label>
              <input
                type="text"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                placeholder="e.g., Downtown Commercial Property"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details about the asset..."
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-2">Estimated Value (USD)</label>
              <input
                type="number"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="1000"
                min="0"
              />
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-300">
                In a real system, RWA tokens would require verification through legal documentation,
                appraisals, and third-party validation. This simulation automatically verifies tokens for demonstration.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setTokenName('');
                  setDescription('');
                  setEstimatedValue('');
                }}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!tokenName || !description || !estimatedValue || parseFloat(estimatedValue) <= 0}
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Token
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
