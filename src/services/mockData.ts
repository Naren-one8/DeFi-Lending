import { User, CryptoAsset, LendingPool, UserDeposit, RWAToken, Loan } from '../types';

const STORAGE_KEY = 'defi_app_data';

interface AppData {
  currentUser: User | null;
  users: User[];
  cryptoAssets: CryptoAsset[];
  lendingPools: LendingPool[];
  userDeposits: UserDeposit[];
  rwaTokens: RWAToken[];
  loans: Loan[];
}

const defaultPools: LendingPool[] = [
  {
    id: 'pool-eth',
    assetType: 'ETH',
    totalDeposited: 1000,
    totalBorrowed: 450,
    interestRate: 5.0,
    utilizationRate: 45,
  },
  {
    id: 'pool-btc',
    assetType: 'BTC',
    totalDeposited: 50,
    totalBorrowed: 20,
    interestRate: 4.5,
    utilizationRate: 40,
  },
  {
    id: 'pool-usdc',
    assetType: 'USDC',
    totalDeposited: 100000,
    totalBorrowed: 60000,
    interestRate: 6.0,
    utilizationRate: 60,
  },
];

const getInitialData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const data = JSON.parse(stored);
    data.userDeposits = data.userDeposits.map((d: any) => ({
      ...d,
      depositedAt: new Date(d.depositedAt),
      lastInterestUpdate: new Date(d.lastInterestUpdate),
    }));
    data.loans = data.loans.map((l: any) => ({
      ...l,
      createdAt: new Date(l.createdAt),
      updatedAt: new Date(l.updatedAt),
    }));
    data.rwaTokens = data.rwaTokens.map((r: any) => ({
      ...r,
      createdAt: new Date(r.createdAt),
    }));
    return data;
  }
  return {
    currentUser: null,
    users: [],
    cryptoAssets: [],
    lendingPools: defaultPools,
    userDeposits: [],
    rwaTokens: [],
    loans: [],
  };
};

let appData: AppData = getInitialData();

const saveData = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
};

export const signUp = (email: string, password: string, displayName: string): User => {
  const existingUser = appData.users.find(u => u.email === email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  const user: User = {
    id: `user-${Date.now()}`,
    email,
    displayName,
    onboardingCompleted: false,
  };

  appData.users.push(user);
  appData.currentUser = user;

  const initialAssets: CryptoAsset[] = [
    {
      id: `asset-${Date.now()}-eth`,
      userId: user.id,
      assetType: 'ETH',
      balance: 10,
      depositedToPool: 0,
    },
    {
      id: `asset-${Date.now()}-btc`,
      userId: user.id,
      assetType: 'BTC',
      balance: 0.5,
      depositedToPool: 0,
    },
    {
      id: `asset-${Date.now()}-usdc`,
      userId: user.id,
      assetType: 'USDC',
      balance: 10000,
      depositedToPool: 0,
    },
  ];

  appData.cryptoAssets.push(...initialAssets);
  saveData();
  return user;
};

export const signIn = (email: string, password: string): User => {
  const user = appData.users.find(u => u.email === email);
  if (!user) {
    throw new Error('Invalid credentials');
  }
  appData.currentUser = user;
  saveData();
  return user;
};

export const signOut = () => {
  appData.currentUser = null;
  saveData();
};

export const getCurrentUser = (): User | null => {
  return appData.currentUser;
};

export const completeOnboarding = () => {
  if (appData.currentUser) {
    appData.currentUser.onboardingCompleted = true;
    const userIndex = appData.users.findIndex(u => u.id === appData.currentUser!.id);
    if (userIndex !== -1) {
      appData.users[userIndex] = appData.currentUser;
    }
    saveData();
  }
};

export const getUserAssets = (userId: string): CryptoAsset[] => {
  return appData.cryptoAssets.filter(a => a.userId === userId);
};

export const getLendingPools = (): LendingPool[] => {
  return appData.lendingPools;
};

export const getUserDeposits = (userId: string): UserDeposit[] => {
  return appData.userDeposits.filter(d => d.userId === userId);
};

export const createDeposit = (userId: string, poolId: string, amount: number): UserDeposit => {
  const asset = appData.cryptoAssets.find(
    a => a.userId === userId && a.assetType === appData.lendingPools.find(p => p.id === poolId)?.assetType
  );

  if (!asset || asset.balance < amount) {
    throw new Error('Insufficient balance');
  }

  asset.balance -= amount;
  asset.depositedToPool += amount;

  const pool = appData.lendingPools.find(p => p.id === poolId);
  if (pool) {
    pool.totalDeposited += amount;
    pool.utilizationRate = (pool.totalBorrowed / pool.totalDeposited) * 100;
  }

  const deposit: UserDeposit = {
    id: `deposit-${Date.now()}`,
    userId,
    poolId,
    amount,
    interestEarned: 0,
    depositedAt: new Date(),
    lastInterestUpdate: new Date(),
  };

  appData.userDeposits.push(deposit);
  saveData();
  return deposit;
};

export const withdrawDeposit = (depositId: string) => {
  const depositIndex = appData.userDeposits.findIndex(d => d.id === depositId);
  if (depositIndex === -1) throw new Error('Deposit not found');

  const deposit = appData.userDeposits[depositIndex];
  const totalAmount = deposit.amount + deposit.interestEarned;

  const asset = appData.cryptoAssets.find(
    a => a.userId === deposit.userId &&
    a.assetType === appData.lendingPools.find(p => p.id === deposit.poolId)?.assetType
  );

  if (asset) {
    asset.balance += totalAmount;
    asset.depositedToPool -= deposit.amount;
  }

  const pool = appData.lendingPools.find(p => p.id === deposit.poolId);
  if (pool) {
    pool.totalDeposited -= deposit.amount;
    pool.utilizationRate = pool.totalDeposited > 0
      ? (pool.totalBorrowed / pool.totalDeposited) * 100
      : 0;
  }

  appData.userDeposits.splice(depositIndex, 1);
  saveData();
};

export const getUserRWATokens = (userId: string): RWAToken[] => {
  return appData.rwaTokens.filter(r => r.userId === userId);
};

export const createRWAToken = (
  userId: string,
  tokenType: RWAToken['tokenType'],
  tokenName: string,
  description: string,
  estimatedValue: number
): RWAToken => {
  const token: RWAToken = {
    id: `rwa-${Date.now()}`,
    userId,
    tokenType,
    tokenName,
    description,
    estimatedValue,
    verificationStatus: 'verified',
    createdAt: new Date(),
  };

  appData.rwaTokens.push(token);
  saveData();
  return token;
};

export const getUserLoans = (userId: string): Loan[] => {
  return appData.loans.filter(l => l.borrowerId === userId);
};

export const createLoan = (
  userId: string,
  poolId: string,
  loanAmount: number,
  collateralType: 'crypto' | 'rwa',
  collateralId: string,
  collateralValue: number
): Loan => {
  const pool = appData.lendingPools.find(p => p.id === poolId);
  if (!pool || pool.totalDeposited - pool.totalBorrowed < loanAmount) {
    throw new Error('Insufficient liquidity in pool');
  }

  if (collateralValue < loanAmount * 1.5) {
    throw new Error('Insufficient collateral (need 150% collateralization)');
  }

  const loan: Loan = {
    id: `loan-${Date.now()}`,
    borrowerId: userId,
    poolId,
    loanAmount,
    collateralType,
    collateralId,
    collateralValue,
    interestRate: pool.interestRate + 2,
    interestAccrued: 0,
    healthFactor: (collateralValue * 0.75) / loanAmount,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  pool.totalBorrowed += loanAmount;
  pool.utilizationRate = (pool.totalBorrowed / pool.totalDeposited) * 100;

  const asset = appData.cryptoAssets.find(
    a => a.userId === userId && a.assetType === pool.assetType
  );
  if (asset) {
    asset.balance += loanAmount;
  }

  appData.loans.push(loan);
  saveData();
  return loan;
};

export const repayLoan = (loanId: string) => {
  const loanIndex = appData.loans.findIndex(l => l.id === loanId);
  if (loanIndex === -1) throw new Error('Loan not found');

  const loan = appData.loans[loanIndex];
  const totalRepayment = loan.loanAmount + loan.interestAccrued;

  const pool = appData.lendingPools.find(p => p.id === loan.poolId);
  const asset = appData.cryptoAssets.find(
    a => a.userId === loan.borrowerId && a.assetType === pool?.assetType
  );

  if (!asset || asset.balance < totalRepayment) {
    throw new Error('Insufficient balance to repay loan');
  }

  asset.balance -= totalRepayment;

  if (pool) {
    pool.totalBorrowed -= loan.loanAmount;
    pool.utilizationRate = pool.totalDeposited > 0
      ? (pool.totalBorrowed / pool.totalDeposited) * 100
      : 0;
  }

  loan.status = 'repaid';
  loan.updatedAt = new Date();
  saveData();
};

export const updateInterest = () => {
  const now = new Date();

  appData.userDeposits.forEach(deposit => {
    const pool = appData.lendingPools.find(p => p.id === deposit.poolId);
    if (!pool) return;

    const timeDiff = (now.getTime() - deposit.lastInterestUpdate.getTime()) / 1000;
    const secondsPerYear = 365 * 24 * 60 * 60;
    const interestGained = deposit.amount * (pool.interestRate / 100) * (timeDiff / secondsPerYear);

    deposit.interestEarned += interestGained;
    deposit.lastInterestUpdate = now;
  });

  appData.loans.forEach(loan => {
    if (loan.status !== 'active') return;

    const timeDiff = (now.getTime() - loan.updatedAt.getTime()) / 1000;
    const secondsPerYear = 365 * 24 * 60 * 60;
    const interestGained = loan.loanAmount * (loan.interestRate / 100) * (timeDiff / secondsPerYear);

    loan.interestAccrued += interestGained;
    loan.healthFactor = (loan.collateralValue * 0.75) / (loan.loanAmount + loan.interestAccrued);
    loan.updatedAt = now;

    if (loan.healthFactor < 1.0) {
      loan.status = 'liquidated';
    }
  });

  saveData();
};
