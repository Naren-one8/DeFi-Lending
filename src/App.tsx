import { useState, useEffect } from 'react';
import { LayoutDashboard, Landmark, TrendingDown, FileText, LogOut, Menu, X } from 'lucide-react';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import LendingPools from './components/LendingPools';
import Borrowing from './components/Borrowing';
import RWAManagement from './components/RWAManagement';
import { getCurrentUser, signOut } from './services/mockData';
import { useInterestSimulation } from './hooks/useInterestSimulation';
import { User } from './types';

type Tab = 'dashboard' | 'lending' | 'borrowing' | 'rwa';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useInterestSimulation(user !== null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleAuthSuccess = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  };

  const handleOnboardingComplete = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  };

  const handleSignOut = () => {
    signOut();
    setUser(null);
    setActiveTab('dashboard');
  };

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  if (!user.onboardingCompleted) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'lending' as Tab, label: 'Lending', icon: Landmark },
    { id: 'borrowing' as Tab, label: 'Borrowing', icon: TrendingDown },
    { id: 'rwa' as Tab, label: 'RWA Tokens', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMS4xMDUuODk1LTIgMi0yczIgLjg5NSAyIDItLjg5NSAyLTIgMi0yLS44OTUtMi0yem0tMTIgMGMwLTEuMTA1Ljg5NS0yIDItMnMyIC44OTUgMiAyLS44OTUgMi0yIDItMi0uODk1LTItMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

      <nav className="relative border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <Landmark className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">DeFi Lending</h1>
                <p className="text-xs text-slate-400 hidden sm:block">Decentralized Finance Platform</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium ${
                      activeTab === tab.id
                        ? 'bg-blue-500 text-white'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-white">{user.displayName}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Sign Out</span>
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium ${
                      activeTab === tab.id
                        ? 'bg-blue-500 text-white'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard key={refreshKey} userId={user.id} userName={user.displayName} />
        )}
        {activeTab === 'lending' && (
          <LendingPools key={refreshKey} userId={user.id} />
        )}
        {activeTab === 'borrowing' && (
          <Borrowing key={refreshKey} userId={user.id} />
        )}
        {activeTab === 'rwa' && (
          <RWAManagement key={refreshKey} userId={user.id} />
        )}
      </main>

      <footer className="relative border-t border-white/10 bg-white/5 backdrop-blur-xl mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-slate-400">
            <p className="mb-2">
              This is a simulated DeFi platform for educational purposes. No real assets or transactions are involved.
            </p>
            <p className="text-xs">
              Interest accrues automatically every 5 seconds. Health factors update in real-time.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
