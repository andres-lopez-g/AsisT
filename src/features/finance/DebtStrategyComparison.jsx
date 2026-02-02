import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Calendar, Zap, Target } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * DebtStrategyComparison - Compare Avalanche vs Snowball debt payoff methods
 * Shows side-by-side comparison with interactive extra payment slider
 */
const DebtStrategyComparison = () => {
    const { user } = useAuth();
    const [comparison, setComparison] = useState(null);
    const [extraPayment, setExtraPayment] = useState(0);
    const [suggestion, setSuggestion] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSuggestion();
    }, []);

    useEffect(() => {
        if (extraPayment >= 0) {
            fetchComparison();
        }
    }, [extraPayment]);

    const fetchSuggestion = async () => {
        try {
            const response = await fetch('/api/smart/debt-strategy/suggest-payment', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSuggestion(data);
                setExtraPayment(data.moderate || 0);
            }
        } catch (error) {
            console.error('Error fetching payment suggestion:', error);
        }
    };

    const fetchComparison = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/smart/debt-strategy', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ extraPayment })
            });

            if (response.ok) {
                const data = await response.json();
                setComparison(data);
            }
        } catch (error) {
            console.error('Error fetching debt strategy:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !comparison) {
        return (
            <div className="tech-card p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Target size={16} className="text-primary" />
                    <h3 className="font-black text-sm uppercase tracking-tight">Debt Optimizer</h3>
                </div>
                <div className="h-64 bg-muted/30 animate-pulse" />
            </div>
        );
    }

    if (!comparison || comparison.message) {
        return (
            <div className="tech-card p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Target size={16} className="text-primary" />
                    <h3 className="font-black text-sm uppercase tracking-tight">Debt Optimizer</h3>
                </div>
                <div className="text-center py-8">
                    <DollarSign size={32} className="mx-auto text-secondary/30 mb-2" />
                    <p className="text-sm text-secondary">No active debts</p>
                    <p className="mono text-[10px] text-secondary/60 mt-1">You're debt-free!</p>
                </div>
            </div>
        );
    }

    const { avalanche, snowball, comparison: comp } = comparison;

    return (
        <div className="tech-card p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Target size={16} className="text-primary" />
                    <h3 className="font-black text-sm uppercase tracking-tight">Debt Strategy Optimizer</h3>
                </div>
                <div className="mono text-[9px] text-secondary/60 uppercase tracking-wider">
                    Comparison Analysis
                </div>
            </div>

            {/* Extra Payment Slider */}
            <div className="mb-6 p-3 bg-muted/30 border border-border">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold">Extra Monthly Payment</label>
                    <div className="font-black text-primary">${extraPayment}</div>
                </div>
                <input
                    type="range"
                    min="0"
                    max={suggestion?.aggressive || 500}
                    step="10"
                    value={extraPayment}
                    onChange={(e) => setExtraPayment(parseInt(e.target.value))}
                    className="w-full h-2 bg-muted appearance-none cursor-pointer slider"
                />
                {suggestion && (
                    <div className="flex items-center justify-between mt-2 mono text-[9px] text-secondary/60">
                        <button
                            onClick={() => setExtraPayment(suggestion.conservative)}
                            className="hover:text-foreground transition-colors"
                        >
                            Conservative: ${suggestion.conservative}
                        </button>
                        <button
                            onClick={() => setExtraPayment(suggestion.moderate)}
                            className="hover:text-foreground transition-colors"
                        >
                            Moderate: ${suggestion.moderate}
                        </button>
                        <button
                            onClick={() => setExtraPayment(suggestion.aggressive)}
                            className="hover:text-foreground transition-colors"
                        >
                            Aggressive: ${suggestion.aggressive}
                        </button>
                    </div>
                )}
            </div>

            {/* Recommendation */}
            <div className={`
        mb-4 p-3 border-l-2 
        ${comp.recommendation === 'avalanche'
                    ? 'bg-green-500/10 border-green-500'
                    : 'bg-blue-500/10 border-blue-500'}
      `}>
                <div className="flex items-start gap-2">
                    <Zap size={14} className={`
            mt-0.5 flex-shrink-0
            ${comp.recommendation === 'avalanche' ? 'text-green-400' : 'text-blue-400'}
          `} />
                    <div>
                        <div className="mono text-[9px] uppercase tracking-wider mb-1 font-bold">
                            Recommended: {comp.recommendation.toUpperCase()}
                        </div>
                        <div className="text-[11px] text-secondary/90">
                            {comp.reasoning}
                        </div>
                    </div>
                </div>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Avalanche Method */}
                <div className={`
          border p-3 transition-all
          ${comp.recommendation === 'avalanche'
                        ? 'border-green-500/50 bg-green-500/5'
                        : 'border-border'}
        `}>
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-black text-xs uppercase">Avalanche</h4>
                        {comp.recommendation === 'avalanche' && (
                            <div className="mono text-[8px] px-1.5 py-0.5 bg-green-500/20 text-green-400 font-bold">
                                BEST
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div>
                            <div className="mono text-[9px] text-secondary/60 uppercase tracking-wider mb-0.5">
                                Payoff Time
                            </div>
                            <div className="font-black text-lg">
                                {avalanche.years} <span className="text-xs text-secondary">years</span>
                            </div>
                            <div className="mono text-[9px] text-secondary/60">
                                {avalanche.months} months
                            </div>
                        </div>

                        <div>
                            <div className="mono text-[9px] text-secondary/60 uppercase tracking-wider mb-0.5">
                                Total Interest
                            </div>
                            <div className="font-black text-red-400">
                                ${avalanche.totalInterestPaid.toLocaleString()}
                            </div>
                        </div>

                        <div>
                            <div className="mono text-[9px] text-secondary/60 uppercase tracking-wider mb-0.5">
                                Strategy
                            </div>
                            <div className="text-[10px]">
                                Highest interest first
                            </div>
                        </div>
                    </div>
                </div>

                {/* Snowball Method */}
                <div className={`
          border p-3 transition-all
          ${comp.recommendation === 'snowball'
                        ? 'border-blue-500/50 bg-blue-500/5'
                        : 'border-border'}
        `}>
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-black text-xs uppercase">Snowball</h4>
                        {comp.recommendation === 'snowball' && (
                            <div className="mono text-[8px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 font-bold">
                                BEST
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div>
                            <div className="mono text-[9px] text-secondary/60 uppercase tracking-wider mb-0.5">
                                Payoff Time
                            </div>
                            <div className="font-black text-lg">
                                {snowball.years} <span className="text-xs text-secondary">years</span>
                            </div>
                            <div className="mono text-[9px] text-secondary/60">
                                {snowball.months} months
                            </div>
                        </div>

                        <div>
                            <div className="mono text-[9px] text-secondary/60 uppercase tracking-wider mb-0.5">
                                Total Interest
                            </div>
                            <div className="font-black text-red-400">
                                ${snowball.totalInterestPaid.toLocaleString()}
                            </div>
                        </div>

                        <div>
                            <div className="mono text-[9px] text-secondary/60 uppercase tracking-wider mb-0.5">
                                Strategy
                            </div>
                            <div className="text-[10px]">
                                Smallest balance first
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Savings Highlight */}
            {comp.interestSaved > 0 && (
                <div className="bg-green-500/10 border border-green-500/30 p-3 mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="mono text-[9px] text-secondary/60 uppercase tracking-wider mb-0.5">
                                Interest Saved (Avalanche)
                            </div>
                            <div className="font-black text-green-400 text-lg">
                                ${comp.interestSaved.toLocaleString()}
                            </div>
                        </div>
                        <TrendingUp size={24} className="text-green-400" />
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="pt-4 border-t border-border">
                <p className="mono text-[9px] text-secondary/60 text-center uppercase tracking-wider">
                    Calculations based on current debt data
                </p>
            </div>
        </div>
    );
};

export default DebtStrategyComparison;
