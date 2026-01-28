import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import ParticlesBackground from './ParticlesBackground';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { login, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const message = location.state?.message;

    // Redirect to dashboard if user is already logged in
    useEffect(() => {
        if (user) {
            navigate('/home', { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await login(email, password);
            // Navigation handled by useEffect when user state updates
        } catch (err) {
            setError(err.message || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            <ParticlesBackground />

            {/* Overlay Grid */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
            <div className="absolute inset-0 border-[20px] border-background pointer-events-none z-20"></div>

            <div className="w-full max-w-sm relative z-30">
                {/* ID Badge / Header */}
                <div className="mb-8 text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 border border-primary/20 bg-background mb-4 relative group">
                        <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
                        <img src="/favicon.png" alt="Logo" className="w-6 h-6 object-contain opacity-80" />

                        {/* Technical Corners */}
                        <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-primary"></div>
                        <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-primary"></div>
                        <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-primary"></div>
                        <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-primary"></div>
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-primary italic">Login</h1>
                    <p className="mono text-[10px] text-secondary uppercase tracking-[0.3em]">Sign in to your account</p>
                </div>

                <div className="tech-card p-8 bg-background/95 backdrop-blur-sm border-primary/10 shadow-[0px_0px_20px_rgba(0,0,0,0.05)]">
                    {/* Status Display */}
                    <div className="mb-8 flex items-center justify-between border-b border-border/40 pb-2">
                        <span className="mono text-[9px] font-bold text-secondary uppercase tracking-widest">Status</span>
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="mono text-[9px] font-bold text-green-600 uppercase tracking-widest">Active</span>
                        </div>
                    </div>

                    {message && (
                        <div className="mb-6 p-3 bg-green-50/50 border border-green-200/50 flex items-center gap-2 text-green-700 mono text-[10px] uppercase tracking-wide animate-in fade-in slide-in-from-top-1">
                            <CheckCircle2 size={12} />
                            <span>{message}</span>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-3 bg-red-50/50 border border-red-200/50 flex items-center gap-2 text-red-700 mono text-[10px] uppercase tracking-wide animate-in fade-in slide-in-from-top-1">
                            <AlertCircle size={12} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="mono text-[9px] font-bold text-secondary uppercase tracking-widest ml-1">Email</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-accent transition-colors">
                                    <Mail size={14} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-muted/30 border border-border rounded-none pl-10 pr-4 py-3 text-sm text-primary placeholder:text-secondary/30 focus:border-accent outline-none mono transition-all"
                                    placeholder="USER@EXAMPLE.COM"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="mono text-[9px] font-bold text-secondary uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-accent transition-colors">
                                    <Lock size={14} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-muted/30 border border-border rounded-none pl-10 pr-4 py-3 text-sm text-primary placeholder:text-secondary/30 focus:border-accent outline-none mono transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-accent text-white font-bold py-4 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-xs uppercase tracking-[0.2em] shadow-[4px_4px_0px_rgba(0,0,0,0.1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={14} />
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight size={14} />
                                </>
                            )}
                        </button>

                        <div className="text-center pt-2">
                            <Link to="/register" className="mono text-[9px] text-secondary hover:text-accent uppercase tracking-widest hover:underline decoration-1 underline-offset-4 transition-all">
                                Create a new account &rarr;
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Footer Code */}
                <div className="mt-8 text-center opacity-30">
                    <p className="mono text-[8px] uppercase tracking-[0.5em]">Version 2.0.4</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
