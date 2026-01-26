import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, FileText, Calendar, Menu, LogOut } from 'lucide-react';

// Auth
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';

// Imports
import FinanceDashboard from './features/finance/FinanceDashboard';
import DocumentManager from './features/documents/DocumentManager';
import PlannerBoard from './features/planner/PlannerBoard';

const SidebarLink = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <Link
      to={to}
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

const ProtectedLayout = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-muted border-r border-border flex flex-col hidden md:flex transition-all">
        <div className="p-4 h-14 border-b border-border flex items-center">
          <Link to="/" className="flex items-center gap-2 text-primary font-semibold hover:opacity-80 transition-opacity">
            <img src="/favicon.png" alt="AsisT Logo" className="w-8 h-8 rounded-md shadow-sm" />
            <span className="text-lg tracking-tight">AsisT</span>
          </Link>
        </div>

        <nav className="flex-1 p-2 space-y-0.5">
          <SidebarLink to="/finance" icon={LayoutDashboard} label="Finance" />
          <SidebarLink to="/documents" icon={FileText} label="Documents" />
          <SidebarLink to="/planner" icon={Calendar} label="Planner" />
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3 text-sm font-medium text-foreground/80">
              <div className="w-6 h-6 rounded bg-accent/10 flex items-center justify-center text-accent text-xs">
                {user.name.charAt(0)}
              </div>
              <span className="truncate max-w-[100px]">{user.name}</span>
            </div>
            <button onClick={logout} className="text-secondary hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden p-4 border-b border-border flex items-center justify-between bg-background">
        <Link to="/" className="flex items-center gap-2 font-semibold text-primary">
          <img src="/favicon.png" alt="AsisT Logo" className="w-6 h-6 rounded" />
          <span>AsisT</span>
        </Link>
        <div className="flex items-center gap-4">
          <button onClick={logout} className="text-secondary hover:text-red-500 transition-colors md:hidden">
            <LogOut size={18} />
          </button>
          <button className="text-foreground"><Menu size={20} /></button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        <Outlet />
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Navigate to="/finance" replace />} />
            <Route path="/finance" element={<FinanceDashboard />} />
            <Route path="/documents" element={<DocumentManager />} />
            <Route path="/planner" element={<PlannerBoard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
