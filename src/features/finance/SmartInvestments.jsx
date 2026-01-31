import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * SmartInvestments - Display top 10 most traded stocks and crypto
 * Uses cached market data refreshed every 24 hours
 */
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
                            const changePercent = stock.change_percentage?.replace('%', '') || '0';
                            
                            return (
                                <div key={index} className="bg-muted/30 border border-border p-2 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="mono text-[9px] text-secondary/60 w-5">
                                                #{index + 1}
                                            </span>
                                            <span className="font-bold text-xs uppercase">{stock.ticker}</span>
                                        </div>
                                        <div className={`
                                            flex items-center gap-1 mono text-[10px] font-bold
                                            ${isPositive ? 'text-green-400' : 'text-red-400'}
                                        `}>
                                            {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                            {changePercent}%
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px]">
                                        <span className="font-bold">${stock.price?.toFixed(2)}</span>
                                        <span className="mono text-secondary/60">
                                            Vol: {(stock.volume / 1000000).toFixed(1)}M
                                        </span>
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
                            
                            return (
                                <div key={index} className="bg-muted/30 border border-border p-2 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="mono text-[9px] text-secondary/60 w-5">
                                                #{index + 1}
                                            </span>
                                            <span className="font-bold text-xs uppercase">{coin.symbol}</span>
                                            <span className="text-[9px] text-secondary/80 truncate max-w-[100px]">
                                                {coin.name}
                                            </span>
                                        </div>
                                        <div className={`
                                            flex items-center gap-1 mono text-[10px] font-bold
                                            ${isPositive ? 'text-green-400' : 'text-red-400'}
                                        `}>
                                            {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                            {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px]">
                                        <span className="font-bold">${coin.current_price?.toLocaleString()}</span>
                                        <span className="mono text-secondary/60">
                                            Vol: ${(coin.total_volume / 1000000000).toFixed(2)}B
                                        </span>
                                    </div>
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
