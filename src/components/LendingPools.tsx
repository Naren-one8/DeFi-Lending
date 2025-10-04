import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Percent, Info } from 'lucide-react';
import { getLendingPools, getUserAssets, createDeposit, withdrawDeposit, getUserDeposits } from '../services/mockData';
import { LendingPool, UserDeposit } from '../types';
import { formatCurrency } from '../utils/calculations';

interface LendingPoolsProps {
  userId: string;
}

export default function LendingPools({ userId }: LendingPoolsProps) {
  const [pools, setPools] = useState<LendingPool[]>([]);
  const [deposits, setDeposits] = useState<UserDeposit[]>([]);
  const [selectedPool, setSelectedPool] = useState<LendingPool | null>(null);
  const [amount, setAmount] = useState('');
  const [showDeposit, setShowDeposit] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = () => {
    setPools(getLendingPools());
    setDeposits(getUserDeposits(userId));
  };

  const handleDeposit = () => {
    if (!selectedPool || !amount) return;

    try {
      createDeposit(userId, selectedPool.id, parseFloat(amount));
      setAmount('');
      setShowDeposit(false);
      setSelectedPool(null);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create deposit');
    }
  };

  const handleWithdraw = (depositId: string) => {
    try {
      withdrawDeposit(depositId);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to withdraw');
    }
  };

  const getAssetBalance = (assetType: string) => {
    const assets = getUserAssets(userId);
    const asset = assets.find(a => a.assetType === assetType);
    return asset?.balance || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Lending Pools</h2>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Info className="w-4 h-4" />
          <span>Deposit crypto to earn interest</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pools.map((pool) => (
          <div
            key={pool.id}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{pool.assetType}</h3>
              <div className="px-3 py-1 bg-green-500/20 rounded-full">
                <span className="text-green-400 text-sm font-semibold">
                  {formatCurrency(pool.interestRate, 2)}% APY
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Deposited</span>
                <span className="text-white font-medium">
                  {formatCurrency(pool.totalDeposited, 2)} {pool.assetType}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Borrowed</span>
                <span className="text-white font-medium">
                  {formatCurrency(pool.totalBorrowed, 2)} {pool.assetType}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Utilization</span>
                <span className="text-white font-medium">
                  {formatCurrency(pool.utilizationRate, 1)}%
                </span>
              </div>
            </div>

            <div className="mb-4">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                  style={{ width: `${Math.min(pool.utilizationRate, 100)}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedPool(pool);
                setShowDeposit(true);
              }}
              className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium"
            >
              Deposit {pool.assetType}
            </button>
          </div>
        ))}
      </div>

      {deposits.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Your Deposits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deposits.map((deposit) => {
              const pool = pools.find(p => p.id === deposit.poolId);
              if (!pool) return null;

              return (
                <div
                  key={deposit.id}
                  className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-white">{pool.assetType} Pool</h4>
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Deposited</span>
                      <span className="text-white font-medium">
                        {formatCurrency(deposit.amount)} {pool.assetType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Interest Earned</span>
                      <span className="text-green-400 font-medium">
                        +{formatCurrency(deposit.interestEarned)} {pool.assetType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Total Value</span>
                      <span className="text-white font-bold">
                        {formatCurrency(deposit.amount + deposit.interestEarned)} {pool.assetType}
                      </span>
                    </div>
                  </div>

                  <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 animate-pulse" />
                    <div
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-400 to-green-500"
                      style={{
                        width: `${Math.min((deposit.interestEarned / deposit.amount) * 100, 100)}%`,
                      }}
                    />
                  </div>

                  <button
                    onClick={() => handleWithdraw(deposit.id)}
                    className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition font-medium border border-white/20"
                  >
                    Withdraw All
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showDeposit && selectedPool && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">
              Deposit {selectedPool.assetType}
            </h3>

            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">
                Available Balance: {formatCurrency(getAssetBalance(selectedPool.assetType))} {selectedPool.assetType}
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.0001"
                min="0"
                max={getAssetBalance(selectedPool.assetType)}
              />
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-blue-400">Estimated Returns</span>
              </div>
              <p className="text-white text-sm">
                At {formatCurrency(selectedPool.interestRate, 2)}% APY, you'll earn approximately{' '}
                <span className="font-bold text-green-400">
                  {formatCurrency(parseFloat(amount || '0') * selectedPool.interestRate / 100, 4)} {selectedPool.assetType}
                </span>{' '}
                per year.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeposit(false);
                  setSelectedPool(null);
                  setAmount('');
                }}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeposit}
                disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > getAssetBalance(selectedPool.assetType)}
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Deposit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
