import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, XCircle, Coins, Shield } from 'lucide-react';
import { getLendingPools, getUserAssets, getUserRWATokens, createLoan, getUserLoans, repayLoan } from '../services/mockData';
import { LendingPool, CryptoAsset, RWAToken, Loan } from '../types';
import { formatCurrency, calculateHealthFactor, getHealthStatus, getHealthColor, getHealthBgColor } from '../utils/calculations';

interface BorrowingProps {
  userId: string;
}

export default function Borrowing({ userId }: BorrowingProps) {
  const [pools, setPools] = useState<LendingPool[]>([]);
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [rwaTokens, setRwaTokens] = useState<RWAToken[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [selectedPool, setSelectedPool] = useState<LendingPool | null>(null);
  const [collateralType, setCollateralType] = useState<'crypto' | 'rwa'>('crypto');
  const [selectedCollateral, setSelectedCollateral] = useState<string>('');
  const [borrowAmount, setBorrowAmount] = useState('');

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = () => {
    setPools(getLendingPools());
    setAssets(getUserAssets(userId));
    setRwaTokens(getUserRWATokens(userId));
    setLoans(getUserLoans(userId));
  };

  const getCollateralValue = (): number => {
    if (collateralType === 'crypto') {
      const asset = assets.find(a => a.id === selectedCollateral);
      if (!asset) return 0;
      const mockPrices: Record<string, number> = { ETH: 2000, BTC: 40000, USDC: 1 };
      return (asset.balance - asset.depositedToPool) * mockPrices[asset.assetType];
    } else {
      const token = rwaTokens.find(t => t.id === selectedCollateral);
      return token?.estimatedValue || 0;
    }
  };

  const maxBorrowAmount = (): number => {
    return getCollateralValue() / 1.5;
  };

  const estimatedHealthFactor = (): number => {
    const amount = parseFloat(borrowAmount || '0');
    if (amount === 0) return 10;
    return calculateHealthFactor(getCollateralValue(), amount, 0);
  };

  const handleBorrow = () => {
    if (!selectedPool || !selectedCollateral || !borrowAmount) return;

    try {
      createLoan(
        userId,
        selectedPool.id,
        parseFloat(borrowAmount),
        collateralType,
        selectedCollateral,
        getCollateralValue()
      );
      setBorrowAmount('');
      setSelectedCollateral('');
      setShowBorrowModal(false);
      setSelectedPool(null);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create loan');
    }
  };

  const handleRepay = (loanId: string) => {
    try {
      repayLoan(loanId);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to repay loan');
    }
  };

  const healthStatus = getHealthStatus(estimatedHealthFactor());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Borrow Assets</h2>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Shield className="w-4 h-4" />
          <span>Requires 150% collateralization</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pools.map((pool) => {
          const available = pool.totalDeposited - pool.totalBorrowed;
          return (
            <div
              key={pool.id}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{pool.assetType}</h3>
                <div className="px-3 py-1 bg-orange-500/20 rounded-full">
                  <span className="text-orange-400 text-sm font-semibold">
                    {formatCurrency(pool.interestRate + 2, 2)}% APR
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Available to Borrow</span>
                  <span className="text-white font-medium">
                    {formatCurrency(available, 2)} {pool.assetType}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Interest Rate</span>
                  <span className="text-white font-medium">
                    {formatCurrency(pool.interestRate + 2, 2)}% APR
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedPool(pool);
                  setShowBorrowModal(true);
                }}
                disabled={available <= 0}
                className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Borrow {pool.assetType}
              </button>
            </div>
          );
        })}
      </div>

      {loans.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Your Loans</h3>
          <div className="space-y-4">
            {loans.map((loan) => {
              const pool = pools.find(p => p.id === loan.poolId);
              if (!pool) return null;

              const status = getHealthStatus(loan.healthFactor);
              const totalDebt = loan.loanAmount + loan.interestAccrued;

              return (
                <div
                  key={loan.id}
                  className={`border rounded-xl p-6 ${
                    loan.status === 'active'
                      ? 'bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">
                        {formatCurrency(loan.loanAmount)} {pool.assetType}
                      </h4>
                      <p className="text-sm text-slate-400">
                        Collateral: {loan.collateralType === 'crypto' ? 'Crypto Assets' : 'RWA Token'}
                      </p>
                    </div>
                    {loan.status === 'active' && (
                      <div className="flex items-center gap-2">
                        {status === 'safe' && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                        {status === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-400" />}
                        {status === 'danger' && <XCircle className="w-5 h-5 text-red-400" />}
                        <span className={`text-sm font-semibold ${getHealthColor(status)}`}>
                          {status.toUpperCase()}
                        </span>
                      </div>
                    )}
                    {loan.status !== 'active' && (
                      <span className="px-3 py-1 bg-slate-500/20 text-slate-400 rounded-full text-sm font-medium">
                        {loan.status.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Borrowed Amount</p>
                      <p className="text-white font-medium">{formatCurrency(loan.loanAmount)} {pool.assetType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Interest Accrued</p>
                      <p className="text-orange-400 font-medium">
                        +{formatCurrency(loan.interestAccrued)} {pool.assetType}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Total to Repay</p>
                      <p className="text-white font-bold">{formatCurrency(totalDebt)} {pool.assetType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Collateral Value</p>
                      <p className="text-white font-medium">${formatCurrency(loan.collateralValue, 0)}</p>
                    </div>
                  </div>

                  {loan.status === 'active' && (
                    <>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-400">Health Factor</span>
                          <span className={`font-bold ${getHealthColor(status)}`}>
                            {formatCurrency(loan.healthFactor, 2)}
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getHealthBgColor(status)} transition-all duration-500`}
                            style={{ width: `${Math.min((loan.healthFactor / 2) * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleRepay(loan.id)}
                        className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium"
                      >
                        Repay Loan
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showBorrowModal && selectedPool && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-white/10 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">
              Borrow {selectedPool.assetType}
            </h3>

            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Collateral Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setCollateralType('crypto');
                    setSelectedCollateral('');
                  }}
                  className={`flex-1 py-2 rounded-lg transition font-medium ${
                    collateralType === 'crypto'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  Crypto
                </button>
                <button
                  onClick={() => {
                    setCollateralType('rwa');
                    setSelectedCollateral('');
                  }}
                  className={`flex-1 py-2 rounded-lg transition font-medium ${
                    collateralType === 'rwa'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  RWA Token
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Select Collateral</label>
              <select
                value={selectedCollateral}
                onChange={(e) => setSelectedCollateral(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose collateral...</option>
                {collateralType === 'crypto'
                  ? assets
                      .filter(a => a.balance - a.depositedToPool > 0)
                      .map(asset => (
                        <option key={asset.id} value={asset.id}>
                          {asset.assetType} ({formatCurrency(asset.balance - asset.depositedToPool)})
                        </option>
                      ))
                  : rwaTokens
                      .filter(t => t.verificationStatus === 'verified')
                      .map(token => (
                        <option key={token.id} value={token.id}>
                          {token.tokenName} (${formatCurrency(token.estimatedValue, 0)})
                        </option>
                      ))}
              </select>
            </div>

            {selectedCollateral && (
              <>
                <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Collateral Value</span>
                    <span className="text-white font-medium">${formatCurrency(getCollateralValue(), 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Max Borrow Amount</span>
                    <span className="text-white font-bold">
                      {formatCurrency(maxBorrowAmount(), 4)} {selectedPool.assetType}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-slate-400 mb-2">Borrow Amount</label>
                  <input
                    type="number"
                    value={borrowAmount}
                    onChange={(e) => setBorrowAmount(e.target.value)}
                    placeholder="0.0"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.0001"
                    min="0"
                    max={maxBorrowAmount()}
                  />
                </div>

                {borrowAmount && parseFloat(borrowAmount) > 0 && (
                  <div className={`p-4 border rounded-lg mb-4 ${
                    healthStatus === 'safe' ? 'bg-green-500/10 border-green-500/20' :
                    healthStatus === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20' :
                    'bg-red-500/10 border-red-500/20'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {healthStatus === 'safe' && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                      {healthStatus === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-400" />}
                      {healthStatus === 'danger' && <XCircle className="w-5 h-5 text-red-400" />}
                      <span className={`font-semibold ${getHealthColor(healthStatus)}`}>
                        Health Factor: {formatCurrency(estimatedHealthFactor(), 2)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300">
                      {healthStatus === 'safe' && 'Your loan is safe and well-collateralized.'}
                      {healthStatus === 'warning' && 'Consider adding more collateral for safety.'}
                      {healthStatus === 'danger' && 'Insufficient collateralization. Risk of liquidation.'}
                    </p>
                  </div>
                )}
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBorrowModal(false);
                  setSelectedPool(null);
                  setBorrowAmount('');
                  setSelectedCollateral('');
                }}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleBorrow}
                disabled={
                  !selectedCollateral ||
                  !borrowAmount ||
                  parseFloat(borrowAmount) <= 0 ||
                  parseFloat(borrowAmount) > maxBorrowAmount() ||
                  estimatedHealthFactor() < 1.5
                }
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Borrow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
