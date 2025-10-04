import { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle2, Wallet, TrendingUp, Shield, FileText } from 'lucide-react';
import { completeOnboarding } from '../services/mockData';

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    icon: Wallet,
    title: 'What is DeFi Lending?',
    description: 'Decentralized Finance (DeFi) allows you to lend and borrow crypto assets without banks or intermediaries. You maintain full control of your funds.',
    tips: [
      'Earn interest by depositing crypto into lending pools',
      'Borrow against your crypto or tokenized real-world assets',
      'Everything is automated by smart contracts',
    ],
  },
  {
    icon: TrendingUp,
    title: 'Earning Interest',
    description: 'When you deposit crypto into a lending pool, you start earning interest immediately. Interest accrues in real-time and compounds automatically.',
    tips: [
      'Different assets have different interest rates',
      'Higher utilization means higher returns',
      'Withdraw anytime with your earned interest',
    ],
  },
  {
    icon: Shield,
    title: 'Borrowing Safely',
    description: 'You can borrow by providing collateral. We require 150% over-collateralization to protect lenders. Your health factor shows how safe your loan is.',
    tips: [
      'Green (>1.5): Your loan is safe',
      'Yellow (1.2-1.5): Add more collateral',
      'Red (<1.2): Risk of liquidation',
    ],
  },
  {
    icon: FileText,
    title: 'Real World Assets (RWA)',
    description: 'Tokenize real-world assets like land, invoices, or gold to use as collateral. This bridges traditional and decentralized finance.',
    tips: [
      'Create tokens for physical assets',
      'Use RWAs as loan collateral',
      'Expand your borrowing capacity',
    ],
  },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 md:p-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center">
              <Icon className="w-10 h-10 text-white" />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-center gap-2 mb-8">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'w-12 bg-blue-500'
                      : index < currentStep
                      ? 'w-8 bg-blue-600'
                      : 'w-8 bg-white/20'
                  }`}
                />
              ))}
            </div>

            <h2 className="text-3xl font-bold text-white mb-4 text-center">
              {step.title}
            </h2>
            <p className="text-lg text-slate-300 text-center mb-8">
              {step.description}
            </p>

            <div className="space-y-4">
              {step.tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3 bg-white/5 rounded-lg p-4">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-200">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center mt-8">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <span className="text-slate-400 text-sm">
              {currentStep + 1} of {steps.length}
            </span>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition transform hover:scale-105"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                completeOnboarding();
                onComplete();
              }}
              className="text-sm text-slate-400 hover:text-slate-300 transition"
            >
              Skip tutorial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
