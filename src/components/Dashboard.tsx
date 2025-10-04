import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, DollarSign, Activity, Coins } from 'lucide-react';
import { getUserAssets, getUserDeposits, getUserLoans, getLendingPools } from '../services/mockData';
import { CryptoAsset, UserDeposit, Loan } from '../types';
import { formatCurrency, getHealthStatus, getHealthColor } from '../utils/calculations';

interface DashboardProps {
  userId: string;
  userName: string;
}

export default function Dashboard({ userId, userName }: DashboardProps) {
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [deposits, setDeposits] = useState<UserDeposit[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = () => {
    setAssets(getUserAssets(userId));
    setDeposits(getUserDeposits(userId));
    setLoans(getUserLoans(userId).filter(l => l.status === 'active'));
  };

  const totalBalance = assets.reduce((sum, asset) => {
    const prices: Record<string, number> = { ETH: 2000, BTC: 40000, USDC: 1 };
    return sum + asset.balance * prices[asset.assetType];
  }, 0);

  const totalDeposited = deposits.reduce((sum, deposit) => {
    const pool = getLendingPools().find(p => p.id === deposit.poolId);
    if (!pool) return sum;
    const prices: Record<string, number> = { ETH: 2000, BTC: 40000, USDC: 1 };
    return sum + deposit.amount * prices[pool.assetType];
  }, 0);

  const totalInterestEarned = deposits.reduce((sum, deposit) => {
    const pool = getLendingPools().find(p => p.id === deposit.poolId);
    if (!pool) return sum;
    const prices: Record<string, number> = { ETH: 2000, BTC: 40000, USDC: 1 };
    return sum + deposit.interestEarned * prices[pool.assetType];
  }, 0);

  const totalBorrowed = loans.reduce((sum, loan) => {
    const pool = getLendingPools().find(p => p.id === loan.poolId);
    if (!pool) return sum;
    const prices: Record<string, number> = { ETH: 2000, BTC: 40000, USDC: 1 };
    return sum + (loan.loanAmount + loan.interestAccrued) * prices[pool.assetType];
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Welcome back, {userName}!</h2>
        <p className="text-slate-400">Here's an overview of your DeFi portfolio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm">Total Balance</span>
            <Wallet className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">${formatCurrency(totalBalance, 0)}</p>
          <p className="text-xs text-slate-400">Across all assets</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm">Total Deposited</span>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">${formatCurrency(totalDeposited, 0)}</p>
          <p className="text-xs text-green-400">+${formatCurrency(totalInterestEarned, 2)} earned</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm">Total Borrowed</span>
            <TrendingDown className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">${formatCurrency(totalBorrowed, 0)}</p>
          <p className="text-xs text-slate-400">{loans.length} active loan{loans.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm">Net Position</span>
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            ${formatCurrency(totalBalance + totalDeposited - totalBorrowed, 0)}
          </p>
          <p className="text-xs text-slate-400">Total portfolio value</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Coins className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Asset Balances</h3>
          </div>
          <div className="space-y-3">
            {assets.map((asset) => {
              const prices: Record<string, number> = { ETH: 2000, BTC: 40000, USDC: 1 };
              const value = asset.balance * prices[asset.assetType];
              const available = asset.balance - asset.depositedToPool;

              return (
                <div key={asset.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="font-semibold text-white">{asset.assetType}</p>
                    <p className="text-xs text-slate-400">
                      {formatCurrency(available)} available
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">{formatCurrency(asset.balance)}</p>
                    <p className="text-xs text-slate-400">${formatCurrency(value, 0)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-bold text-white">Active Loans</h3>
          </div>
          {loans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No active loans</p>
            </div>
          ) : (
            <div className="space-y-3">
              {loans.map((loan) => {
                const pool = getLendingPools().find(p => p.id === loan.poolId);
                if (!pool) return null;

                const status = getHealthStatus(loan.healthFactor);
                const totalDebt = loan.loanAmount + loan.interestAccrued;

                return (
                  <div key={loan.id} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-white">
                        {formatCurrency(loan.loanAmount)} {pool.assetType}
                      </p>
                      <span className={`text-xs font-semibold ${getHealthColor(status)}`}>
                        {status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>To repay: {formatCurrency(totalDebt)} {pool.assetType}</span>
                      <span>HF: {formatCurrency(loan.healthFactor, 2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Quick Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-white font-medium text-sm mb-1">Earn Passive Income</p>
              <p className="text-slate-400 text-xs">Deposit idle crypto to earn interest automatically</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <p className="text-white font-medium text-sm mb-1">Borrow Safely</p>
              <p className="text-slate-400 text-xs">Keep your health factor above 1.5 to stay safe</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Coins className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-medium text-sm mb-1">Use RWA Tokens</p>
              <p className="text-slate-400 text-xs">Tokenize real assets to expand borrowing power</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
