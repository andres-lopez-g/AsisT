import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, BarChart3, DollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * SpendingInsights - Trend analysis and anomaly detection
 * Shows category trends, unusual transactions, and spending patterns
 */
const SpendingInsights = () => {
    const { user } = useAuth();
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInsights();
    }, []);

    const fetchInsights = async () => {
        try {
            const response = await fetch('/api/smart/insights', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setInsights(data);
            }
        } catch (error) {
            console.error('Error fetching insights:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="tech-card p-4">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 size={16} className="text-primary" />
                    <h3 className="font-black text-sm uppercase tracking-tight">Spending Insights</h3>
                </div>
                <div className="h-64 bg-muted/30 animate-pulse" />
            </div>
        );
    }

    if (!insights) {
        return null;
    }

    const { trends, anomalies, duplicates } = insights;

    return (
        <div className="tech-card p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <BarChart3 size={16} className="text-primary" />
                    <h3 className="font-black text-sm uppercase tracking-tight">Spending Insights</h3>
                </div>
                <div className="mono text-[9px] text-secondary/60 uppercase tracking-wider">
                    Last 3 Months
                </div>
            </div>

            {/* Category Trends */}
            {trends && trends.length > 0 && (
                <div className="mb-6">
                    <div className="mono text-[9px] text-secondary/60 uppercase tracking-wider mb-3">
                        Category Trends (MoM)
                    </div>
                    <div className="space-y-2">
                        {trends.slice(0, 5).map((trend, index) => (
                            <div key={index} className="bg-muted/30 border border-border p-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-xs">{trend.category}</span>
                                    <div className={`
                    flex items-center gap-1 mono text-[10px] font-bold
                    ${trend.percentChange > 0 ? 'text-red-400' : 'text-green-400'}
                  `}>
                                        {trend.percentChange > 0 ? (
                                            <TrendingUp size={12} />
                                        ) : (
                                            <TrendingDown size={12} />
                                        )}
                                        {Math.abs(trend.percentChange)}%
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-[10px] text-secondary/80">
                                    <span>
                                        ${trend.previousMonth.toFixed(2)} → ${trend.currentMonth.toFixed(2)}
                                    </span>
                                    <span className={`
                    mono text-[8px] px-1.5 py-0.5 uppercase font-bold
                    ${trend.trend === 'increasing' ? 'bg-red-500/20 text-red-400' :
                                            trend.trend === 'decreasing' ? 'bg-green-500/20 text-green-400' :
                                                'bg-blue-500/20 text-blue-400'}
                  `}>
                                        {trend.trend}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Anomalies */}
            {anomalies && anomalies.length > 0 && (
                <div className="mb-6">
                    <div className="mono text-[9px] text-secondary/60 uppercase tracking-wider mb-3">
                        Unusual Transactions
                    </div>
                    <div className="space-y-2">
                        {anomalies.slice(0, 3).map((anomaly, index) => (
                            <div
                                key={index}
                                className={`
                  border-l-2 p-2
                  ${anomaly.severity === 'high'
                                        ? 'bg-red-500/10 border-red-500'
                                        : anomaly.severity === 'medium'
                                            ? 'bg-yellow-500/10 border-yellow-500'
                                            : 'bg-blue-500/10 border-blue-500'}
                `}
                            >
                                <div className="flex items-start gap-2">
                                    <AlertTriangle size={14} className={`
                    mt-0.5 flex-shrink-0
                    ${anomaly.severity === 'high' ? 'text-red-400' :
                                            anomaly.severity === 'medium' ? 'text-yellow-400' :
                                                'text-blue-400'}
                  `} />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-xs mb-0.5 truncate">
                                            {anomaly.transaction.title}
                                        </div>
                                        <div className="text-[10px] text-secondary/90 mb-1">
                                            {anomaly.message}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="mono text-[9px] text-secondary/60">
                                                {new Date(anomaly.transaction.date).toLocaleDateString()}
                                            </span>
                                            <span className="font-black text-xs text-red-400">
                                                ${anomaly.transaction.amount.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Potential Duplicates */}
            {duplicates && duplicates.length > 0 && (
                <div className="mb-4">
                    <div className="mono text-[9px] text-secondary/60 uppercase tracking-wider mb-3">
                        Potential Duplicates
                    </div>
                    <div className="space-y-2">
                        {duplicates.slice(0, 2).map((dup, index) => (
                            <div key={index} className="bg-yellow-500/10 border border-yellow-500/30 p-2">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-xs mb-0.5 truncate">
                                            {dup.transaction1.title}
                                        </div>
                                        <div className="text-[10px] text-secondary/90 mb-1">
                                            {dup.message}
                                        </div>
                                        <div className="flex items-center gap-2 mono text-[9px] text-secondary/60">
                                            <span>${dup.transaction1.amount}</span>
                                            <span>•</span>
                                            <span>{new Date(dup.transaction1.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {(!trends || trends.length === 0) &&
                (!anomalies || anomalies.length === 0) &&
                (!duplicates || duplicates.length === 0) && (
                    <div className="text-center py-8">
                        <BarChart3 size={32} className="mx-auto text-secondary/30 mb-2" />
                        <p className="text-sm text-secondary">No insights available yet</p>
                        <p className="mono text-[10px] text-secondary/60 mt-1">Add more transactions to see patterns</p>
                    </div>
                )}

            {/* Footer */}
            <div className="pt-4 border-t border-border">
                <p className="mono text-[9px] text-secondary/60 text-center uppercase tracking-wider">
                    Powered by pattern analysis
                </p>
            </div>
        </div>
    );
};

export default SpendingInsights;
