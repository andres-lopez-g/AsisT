import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';

/**
 * SmartInvestments - Display top 10 most traded stocks and crypto
 * Uses cached market data refreshed every 24 hours
 */

// Mini area chart component for crypto sparklines
const MiniAreaChart = ({ data, isPositive }) => {
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    
    const chartData = data.map((value, index) => ({ value, index }));
    const color = isPositive ? '#4ade80' : '#f87171';
    const fillColor = isPositive ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)';
    
    return (
        <div style={{ width: '100%', height: '32px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id={`gradient-${isPositive ? 'positive' : 'negative'}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={color} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={color} 
                        strokeWidth={1.5}
                        fill={`url(#gradient-${isPositive ? 'positive' : 'negative'})`}
                        animationDuration={500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

// Performance badge showing price change magnitude
const PerformanceBadge = ({ changePercent, isPositive }) => {
    const value = Math.abs(parseFloat(changePercent) || 0);
    
    // Determine intensity based on magnitude
    let intensity = 'low';
    if (value >= 5) intensity = 'high';
    else if (value >= 2) intensity = 'medium';
    
    const bgColors = {
        positive: {
            high: 'bg-green-500/20 border-green-400/40',
            medium: 'bg-green-500/15 border-green-400/30',
            low: 'bg-green-500/10 border-green-400/20'
        },
        negative: {
            high: 'bg-red-500/20 border-red-400/40',
            medium: 'bg-red-500/15 border-red-400/30',
            low: 'bg-red-500/10 border-red-400/20'
        }
    };
    
    const colorClass = bgColors[isPositive ? 'positive' : 'negative'][intensity];
    
    return (
        <div className={`px-2 py-1 rounded border ${colorClass} backdrop-blur-sm`}>
            <div className="flex items-center gap-1">
                {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                <span className="mono text-[10px] font-bold">
                    {isPositive ? '+' : '-'}{value.toFixed(2)}%
                </span>
            </div>
        </div>
    );
};

const SmartInvestments = () => {
    const { authFetch } = useAuth();
    const [investmentData, setInvestmentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInvestments = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await authFetch('/api/smart/investments');
                
                if (response.ok) {
                    const data = await response.json();
                    setInvestmentData(data);
                } else {
                    setError('Failed to load investment data');
                }
            } catch (err) {
                console.error('Error fetching investments:', err);
                setError('Failed to load investment data');
            } finally {
                setLoading(false);
            }
        };

        fetchInvestments();
    }, [authFetch]);

    if (loading) {
        return (
            <div className="tech-card p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Activity size={16} className="text-primary" />
                    <h3 className="font-black text-sm uppercase tracking-tight">Smart Investments</h3>
                </div>
                <div className="h-64 bg-muted/30 animate-pulse" />
            </div>
        );
    }

    if (error || !investmentData) {
        return (
            <div className="tech-card p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Activity size={16} className="text-primary" />
                    <h3 className="font-black text-sm uppercase tracking-tight">Smart Investments</h3>
                </div>
                <div className="text-center py-8">
                    <Activity size={32} className="mx-auto text-secondary/30 mb-2" />
                    <p className="text-sm text-secondary">Unable to load market data</p>
                    <p className="mono text-[10px] text-secondary/60 mt-1">Try again later</p>
                </div>
            </div>
        );
    }

    const { stocks, crypto } = investmentData;

    return (
        <div className="tech-card p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Activity size={16} className="text-primary" />
                    <h3 className="font-black text-sm uppercase tracking-tight">Smart Investments</h3>
                </div>
                <div className="mono text-[9px] text-secondary/60 uppercase tracking-wider">
                    Most Traded
                </div>
            </div>

            {/* Top 10 Stocks Section */}
            <div className="mb-6">
                <div className="mono text-[9px] text-secondary/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <DollarSign size={12} />
                    Top 10 Stocks
                </div>
                {stocks && stocks.length > 0 ? (
                    <div className="space-y-2">
                        {stocks.map((stock, index) => {
                            const isPositive = parseFloat(stock.change_amount) >= 0;
                            const changePercent = stock.change_percentage?.replaceAll('%', '').replaceAll('+', '') || '0';
                            
                            return (
                                <div key={index} className="bg-muted/30 border border-border p-3 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="mono text-[9px] text-secondary/60">
                                                #{index + 1}
                                            </span>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm uppercase">{stock.ticker}</span>
                                                <span className="font-bold text-xs text-primary">${stock.price?.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-right">
                                                <PerformanceBadge changePercent={changePercent} isPositive={isPositive} />
                                                <div className="mono text-[9px] text-secondary/60 mt-1">
                                                    Vol: {(stock.volume / 1000000).toFixed(1)}M
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-4 text-secondary mono text-[10px]">
                        No stock data available
                    </div>
                )}
            </div>

            {/* Top 10 Crypto Section */}
            <div className="mb-4">
                <div className="mono text-[9px] text-secondary/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Activity size={12} />
                    Top 10 Crypto
                </div>
                {crypto && crypto.length > 0 ? (
                    <div className="space-y-2">
                        {crypto.map((coin, index) => {
                            const isPositive = coin.price_change_percentage_24h >= 0;
                            const sparklineData = coin.sparkline_in_7d?.price || [];
                            
                            return (
                                <div key={index} className="bg-muted/30 border border-border p-3 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="mono text-[9px] text-secondary/60">
                                                #{index + 1}
                                            </span>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm uppercase">{coin.symbol}</span>
                                                    <span className="text-[9px] text-secondary/80 truncate max-w-[80px]">
                                                        {coin.name}
                                                    </span>
                                                </div>
                                                <span className="font-bold text-xs text-primary">${coin.current_price?.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <PerformanceBadge 
                                                changePercent={Math.abs(coin.price_change_percentage_24h).toFixed(2)} 
                                                isPositive={isPositive} 
                                            />
                                            <div className="mono text-[9px] text-secondary/60 mt-1">
                                                Vol: ${(coin.total_volume / 1000000000).toFixed(2)}B
                                            </div>
                                        </div>
                                    </div>
                                    {/* 7-day area chart */}
                                    {sparklineData.length > 0 && (
                                        <div className="mt-2">
                                            <MiniAreaChart data={sparklineData} isPositive={isPositive} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-4 text-secondary mono text-[10px]">
                        No crypto data available
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-border">
                <p className="mono text-[9px] text-secondary/60 text-center uppercase tracking-wider">
                    Data refreshed every 24 hours
                </p>
            </div>
        </div>
    );
};

export default SmartInvestments;
