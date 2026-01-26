import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import ParticlesBackground from './ParticlesBackground';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const message = location.state?.message;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            <ParticlesBackground />

            <div className="w-full max-w-sm relative z-10">
                <div className="minimal-card p-8 md:p-10 bg-white/80 backdrop-blur-sm">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-white mb-4 shadow-xl shadow-primary/5 p-2 border border-border/50">
                            <img src="/favicon.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2 text-foreground">Sign In</h1>
                        <p className="text-secondary text-sm">Welcome back to your assistant</p>
                    </div>

                    {message && (
                        <div className="mb-6 p-3 bg-green-50 border border-green-100 rounded-md flex items-center gap-2 text-green-600 text-xs animate-in fade-in slide-in-from-top-1">
                            <CheckCircle2 size={14} />
                            <span>{message}</span>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-md flex items-center gap-2 text-red-600 text-xs animate-in fade-in slide-in-from-top-1">
                            <AlertCircle size={14} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-secondary uppercase tracking-wider ml-1">Email</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors">
                                    <Mail size={16} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-muted/30 border border-border rounded-md pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-secondary/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-secondary uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors">
                                    <Lock size={16} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-muted/30 border border-border rounded-md pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-secondary/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm mt-6 shadow-md shadow-primary/10 active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={16} />
                            ) : (
                                <>
                                    <span>Continue</span>
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>

                        <div className="text-center mt-6">
                            <p className="text-xs text-secondary">
                                New here?{' '}
                                <Link to="/register" className="text-primary font-bold hover:underline">
                                    Create account
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
