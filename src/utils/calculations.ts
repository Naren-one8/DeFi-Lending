import { HealthStatus, Loan } from '../types';

export const calculateHealthFactor = (collateralValue: number, loanAmount: number, interestAccrued: number): number => {
  const totalDebt = loanAmount + interestAccrued;
  if (totalDebt === 0) return 10;
  return (collateralValue * 0.75) / totalDebt;
};

export const getHealthStatus = (healthFactor: number): HealthStatus => {
  if (healthFactor >= 1.5) return 'safe';
  if (healthFactor >= 1.2) return 'warning';
  return 'danger';
};

export const calculateInterestEarned = (
  principal: number,
  annualRate: number,
  timeInSeconds: number
): number => {
  const secondsPerYear = 365 * 24 * 60 * 60;
  return principal * (annualRate / 100) * (timeInSeconds / secondsPerYear);
};

export const calculateLoanInterest = (loan: Loan, currentTime: Date): number => {
  const timeElapsed = (currentTime.getTime() - loan.createdAt.getTime()) / 1000;
  return calculateInterestEarned(loan.loanAmount, loan.interestRate, timeElapsed);
};

export const formatCurrency = (value: number, decimals: number = 4): string => {
  return value.toFixed(decimals);
};

export const calculateUtilizationRate = (totalBorrowed: number, totalDeposited: number): number => {
  if (totalDeposited === 0) return 0;
  return (totalBorrowed / totalDeposited) * 100;
};

export const getHealthColor = (status: HealthStatus): string => {
  switch (status) {
    case 'safe':
      return 'text-green-500';
    case 'warning':
      return 'text-yellow-500';
    case 'danger':
      return 'text-red-500';
  }
};

export const getHealthBgColor = (status: HealthStatus): string => {
  switch (status) {
    case 'safe':
      return 'bg-green-500';
    case 'warning':
      return 'bg-yellow-500';
    case 'danger':
      return 'bg-red-500';
  }
};
