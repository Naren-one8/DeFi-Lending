export interface User {
  id: string;
  email: string;
  displayName: string;
  onboardingCompleted: boolean;
}

export interface CryptoAsset {
  id: string;
  userId: string;
  assetType: 'ETH' | 'BTC' | 'USDC';
  balance: number;
  depositedToPool: number;
}

export interface LendingPool {
  id: string;
  assetType: 'ETH' | 'BTC' | 'USDC';
  totalDeposited: number;
  totalBorrowed: number;
  interestRate: number;
  utilizationRate: number;
}

export interface UserDeposit {
  id: string;
  userId: string;
  poolId: string;
  amount: number;
  interestEarned: number;
  depositedAt: Date;
  lastInterestUpdate: Date;
}

export interface RWAToken {
  id: string;
  userId: string;
  tokenType: 'land' | 'invoice' | 'gold' | 'property';
  tokenName: string;
  description: string;
  estimatedValue: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
}

export interface Loan {
  id: string;
  borrowerId: string;
  poolId: string;
  loanAmount: number;
  collateralType: 'crypto' | 'rwa';
  collateralId: string;
  collateralValue: number;
  interestRate: number;
  interestAccrued: number;
  healthFactor: number;
  status: 'active' | 'repaid' | 'liquidated';
  createdAt: Date;
  updatedAt: Date;
}

export type HealthStatus = 'safe' | 'warning' | 'danger';
