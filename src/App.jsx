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
const LandingPage = lazy(() => import('./features/landing/LandingPage'));

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
        flex items-center gap-3 px-4 py-3 transition-all duration-200 group relative
        ${isActive
          ? 'bg-primary text-white'
          : 'text-secondary hover:text-foreground hover:bg-muted'
        }
      `}
    >
      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
      <span className={`text-sm font-bold tracking-tight ${isActive ? 'opacity-100' : 'opacity-80'}`}>
        {label}
      </span>
      {isActive && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-2/3 bg-accent animate-in fade-in slide-in-from-right-1 duration-300" />
      )}
    </Link>
  );
};

import ErrorBoundary from './components/ErrorBoundary';

import LanguageSwitcher from './components/LanguageSwitcher';

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
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-[2px] animate-in fade-in duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - "The Control Strip" */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border flex flex-col transition-transform duration-300 md:translate-x-0 md:static
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 h-20 border-b border-border flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-3 group" onClick={() => setSidebarOpen(false)}>
            <div className="w-9 h-9 bg-primary flex items-center justify-center rounded-sm group-hover:bg-accent transition-colors duration-300">
              <img src="/favicon.png" alt="AsisT" className="w-6 h-6 contrast-125 invert" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic">AsisT</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-secondary p-1">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4">
          <p className="mono text-[10px] font-bold text-secondary/60 uppercase tracking-[0.2em] mb-4">Operations</p>
          <nav className="space-y-1 -mx-6">
            <SidebarLink to="/home" icon={LayoutDashboard} label="Dashboard" onClick={() => setSidebarOpen(false)} />
            <SidebarLink to="/finance" icon={CreditCard} label="Capital" onClick={() => setSidebarOpen(false)} />
            <SidebarLink to="/payment-analyst" icon={TrendingUp} label="Analysis" onClick={() => setSidebarOpen(false)} />
            <SidebarLink to="/planner" icon={Calendar} label="Objectives" onClick={() => setSidebarOpen(false)} />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-border bg-muted/30">
          <div className="space-y-6">
            <div>
              <p className="mono text-[9px] font-bold text-secondary/60 uppercase tracking-[0.2em] mb-2">Interface</p>
              <LanguageSwitcher />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/5 border border-border flex items-center justify-center text-primary font-bold text-xs mono">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || '?'}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold truncate max-w-[100px] leading-none">
                    {user?.name || user?.email?.split('@')[0] || 'User'}
                  </span>
                  <span className="mono text-[8px] text-secondary uppercase tracking-wider mt-1">Verified User</span>
                </div>
              </div>
              <button onClick={logout} className="text-secondary hover:text-accent transition-colors p-1" title="Log out system">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden p-4 border-b border-border flex items-center justify-between bg-background z-30">
          <Link to="/home" className="flex items-center gap-2 font-black italic uppercase tracking-tighter text-primary">
            <img src="/favicon.png" alt="Logo" className="w-6 h-6" />
            <span>AsisT</span>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(true)} className="text-primary border border-border p-2">
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-background selection:bg-accent/10">
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
          <ErrorBoundary>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route element={<ProtectedLayout />}>
                {/* Redirect /app or similar if needed, or just let users navigate manually from landing */}
                {/* Actually, if user goes to /home, they see HomeView. We keep that. */}
                <Route path="/home" element={<HomeView />} />
                <Route path="/finance" element={<FinanceDashboard />} />
                <Route path="/payment-analyst" element={<PaymentAnalyst />} />
                <Route path="/planner" element={<PlannerBoard />} />
              </Route>
            </Routes>
          </ErrorBoundary>
        </Suspense>
      </Router>
    </AuthProvider>
  );
};

export default App;
