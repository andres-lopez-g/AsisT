import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Calendar, Menu, LogOut, CreditCard, X, Loader2, TrendingUp, Languages } from 'lucide-react';

// Auth
import { AuthProvider, useAuth } from './context/AuthContext';
const LoginPage = lazy(() => import('./features/auth/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/RegisterPage'));

// Imports
const HomeView = lazy(() => import('./features/home/HomeView'));
const FinanceDashboard = lazy(() => import('./features/finance/FinanceDashboard'));
const PaymentAnalyst = lazy(() => import('./features/finance/PaymentAnalyst'));
const PlannerBoard = lazy(() => import('./features/planner/PlannerBoard'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full w-full">
    <Loader2 className="w-8 h-8 text-primary animate-spin" />
  </div>
);

const SidebarLink = ({ to, icon: Icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200 text-sm font-medium
        ${isActive
          ? 'bg-white shadow-sm text-primary'
          : 'text-secondary hover:bg-black/5 hover:text-foreground'
        }
      `}
    >
      <Icon size={18} />
      <span>{label}</span>
      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
    </Link>
  );
};

const LanguageSwitcher = () => {
  const switchLanguage = (lang) => {
    const trySwitch = (attempts) => {
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = lang;
        select.dispatchEvent(new Event('change'));
      } else if (attempts > 0) {
        setTimeout(() => trySwitch(attempts - 1), 500);
      }
    };
    trySwitch(5);
  };

  return (
    <div className="flex items-center gap-2 p-1 bg-white/50 rounded-lg border border-border/50">
      <button
        onClick={() => switchLanguage('en')}
        className="px-2 py-1 text-[10px] font-bold rounded hover:bg-white transition-colors"
      >
        EN
      </button>
      <div className="w-[1px] h-3 bg-border" />
      <Languages size={14} className="text-secondary" />
      <div className="w-[1px] h-3 bg-border" />
      <button
        onClick={() => switchLanguage('es')}
        className="px-2 py-1 text-[10px] font-bold rounded hover:bg-white transition-colors"
      >
        ES
      </button>
    </div>
  );
};

const ProtectedLayout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans relative">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-muted border-r border-border flex flex-col transition-transform duration-300 md:translate-x-0 md:static
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 h-14 border-b border-border flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary font-semibold hover:opacity-80 transition-opacity" onClick={() => setSidebarOpen(false)}>
            <img src="/favicon.png" alt="AsisT Logo" className="w-8 h-8 rounded-md shadow-sm" />
            <span className="text-lg tracking-tight">AsisT</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-secondary p-1">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-0.5">
          <SidebarLink to="/home" icon={LayoutDashboard} label="Home" onClick={() => setSidebarOpen(false)} />
          <SidebarLink to="/finance" icon={CreditCard} label="Finance" onClick={() => setSidebarOpen(false)} />
          <SidebarLink to="/payment-analyst" icon={TrendingUp} label="Payment Analyst" onClick={() => setSidebarOpen(false)} />
          <SidebarLink to="/planner" icon={Calendar} label="Planner" onClick={() => setSidebarOpen(false)} />
        </nav>

        <div className="p-4 border-t border-border space-y-4">
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest ml-1">Language</p>
            <LanguageSwitcher />
            <div id="google_translate_element" className="hidden"></div>
          </div>
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3 text-sm font-medium text-foreground/80">
              <div className="w-6 h-6 rounded bg-accent/10 flex items-center justify-center text-accent text-xs">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || '?'}
              </div>
              <span className="truncate max-w-[100px]">{user?.name || user?.email || 'User'}</span>
            </div>
            <button onClick={logout} className="text-secondary hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden p-4 border-b border-border flex items-center justify-between bg-background z-30">
          <Link to="/home" className="flex items-center gap-2 font-semibold text-primary">
            <img src="/favicon.png" alt="AsisT Logo" className="w-6 h-6 rounded" />
            <span>AsisT</span>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={logout} className="text-secondary hover:text-red-500 p-2">
              <LogOut size={18} />
            </button>
            <button onClick={() => setSidebarOpen(true)} className="text-foreground p-2">
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<HomeView />} />
              <Route path="/finance" element={<FinanceDashboard />} />
              <Route path="/payment-analyst" element={<PaymentAnalyst />} />
              <Route path="/planner" element={<PlannerBoard />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
};

export default App;
