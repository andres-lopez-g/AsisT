import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, CreditCard, TrendingUp, ArrowRight, ShieldCheck, Activity, Globe } from 'lucide-react';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import ParticlesBackground from '../auth/ParticlesBackground';
import { useAuth } from '../../context/AuthContext';

const FeatureCard = ({ icon: Icon, title, description, code }) => (
    <div className="tech-card p-6 group relative overflow-hidden bg-background/80 hover:bg-background/95 transition-all">
        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Icon size={80} />
        </div>

        <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-primary/5 rounded-sm border border-primary/10 text-primary">
                    <Icon size={24} strokeWidth={1.5} />
                </div>
                <span className="mono text-[9px] text-secondary uppercase tracking-widest">{code}</span>
            </div>

            <h3 className="text-xl font-bold mb-2 tracking-tight group-hover:text-accent transition-colors">{title}</h3>
            <p className="text-secondary text-sm leading-relaxed mb-4">
                {description}
            </p>

            <div className="w-8 h-1 bg-primary/10 group-hover:bg-accent transition-colors duration-500" />
        </div>
    </div>
);

const LandingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Redirect to dashboard if user is already logged in
    useEffect(() => {
        if (user) {
            navigate('/home');
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent/20 overflow-x-hidden">
            {/* Background FX */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <ParticlesBackground />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary text-white flex items-center justify-center font-bold rounded-sm">
                            <img src="/favicon.png" alt="Logo" className="w-5 h-5 filter invert contrast-125" />
                        </div>
                        <span className="font-black text-lg tracking-tighter uppercase italic">AsisT <span className="text-secondary font-normal not-italic text-xs tracking-widest ml-2 hidden sm:inline-block opacity-60">| SYSTEM_ACCESS</span></span>
                    </div>

                    <div className="flex items-center gap-6">
                        <LanguageSwitcher />
                        <div className="h-4 w-px bg-border/60 hidden sm:block"></div>
                        <Link to="/login" className="hidden sm:flex mono text-[10px] font-bold uppercase tracking-widest hover:text-accent transition-colors">
                            [ Login ]
                        </Link>
                        <Link to="/register" className="bg-primary hover:bg-accent text-white px-5 py-2 text-xs font-bold uppercase tracking-widest transition-all hover:shadow-lg hover:shadow-accent/20 flex items-center gap-2 group">
                            <span>Initialize</span>
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-32 pb-20 px-6 z-10">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/5 border border-accent/20 rounded-full mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                        </span>
                        <span className="mono text-[9px] font-bold text-accent uppercase tracking-widest">System Online v2.0</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[1.1]">
                        AsisT <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-secondary">FinApp</span>
                    </h1>

                    <p className="text-lg md:text-xl text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
                        Advanced life-management orchestration for the modern operator.
                        Financial telemetry, objective tracking, and operational analytics in one unified interface.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-bold uppercase tracking-widest hover:bg-accent transition-all hover:scale-105 shadow-xl duration-300">
                            Start Operations
                        </Link>
                        <a href="#features" className="w-full sm:w-auto px-8 py-4 border border-border text-primary font-bold uppercase tracking-widest hover:bg-muted transition-all">
                            View Capabilities
                        </a>
                    </div>
                </div>
            </header>

            {/* Features Grid */}
            <section id="features" className="py-20 px-6 bg-muted/30 border-y border-border/40 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-16">
                        <span className="mono text-[10px] font-bold text-accent uppercase tracking-widest block mb-2">System Modules</span>
                        <h2 className="text-3xl font-black tracking-tight uppercase">Operational Capabilities</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FeatureCard
                            icon={LayoutDashboard}
                            title="Command Center"
                            code="MOD_DASH_01"
                            description="Centralized telemetry of all user activities. Real-time updates on tasks, events, and system notifications."
                        />
                        <FeatureCard
                            icon={CreditCard}
                            title="Financial Core"
                            code="MOD_FIN_02"
                            description="Precise capital tracking. Monitor cashflow, manage debt vectors, and analyze spending patterns with granular control."
                        />
                        <FeatureCard
                            icon={TrendingUp}
                            title="Vector Analysis"
                            code="MOD_ANL_03"
                            description="Visual analytics engine. Transform raw data into actionable intelligence through advanced charting and trend projection."
                        />
                        <FeatureCard
                            icon={Calendar}
                            title="Objective Planner"
                            code="MOD_PLN_04"
                            description="Strategic timeline management. Kanban-style execution boards for short-term tasks and long-term directives."
                        />
                    </div>
                </div>
            </section>

            {/* Trust / Technical Stats Strip */}
            <section className="py-12 px-6 border-b border-border/40 bg-background z-10 relative">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center md:justify-between gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={20} />
                        <span className="mono text-xs font-bold uppercase tracking-widest">Encrypted_Vault</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Activity size={20} />
                        <span className="mono text-xs font-bold uppercase tracking-widest">99.9% Uptime</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Globe size={20} />
                        <span className="mono text-xs font-bold uppercase tracking-widest">Global_Access</span>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-6 relative z-10 overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 skew-y-3 scale-110 pointer-events-none"></div>
                <div className="max-w-4xl mx-auto text-center relative">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-8 uppercase">
                        Ready to Optimize?
                    </h2>
                    <p className="text-secondary text-lg mb-10 max-w-xl mx-auto">
                        Join the network of high-performance operators using AsisT to manage their life infrastructure.
                    </p>
                    <div className="inline-block p-1 border border-primary/20 bg-background/50 backdrop-blur-sm rounded-sm">
                        <Link to="/register" className="block px-12 py-5 bg-primary text-white font-bold uppercase tracking-[0.2em] hover:bg-accent transition-all hover:shadow-[0_0_30px_rgba(0,0,0,0.2)]">
                            Initialize System Access
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-border bg-background z-10 relative">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2 opacity-50">
                        <img src="/favicon.png" alt="Logo" className="w-4 h-4" />
                        <span className="mono text-[10px] font-bold uppercase tracking-widest">AsisT // Fusion Observatory</span>
                    </div>
                    <div className="mono text-[10px] text-secondary uppercase tracking-widest">
                        System_Ver 2.5.0 // © 2026
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
