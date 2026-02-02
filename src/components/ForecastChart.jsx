import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, AlertTriangle, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * ForecastChart - Balance projection visualization
 * Shows 30/60/90-day balance forecasts with confidence bands
 */
const ForecastChart = ({ days = 90, transactions = [] }) => {
    const { user } = useAuth();
    const [forecastData, setForecastData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState(30);

    useEffect(() => {
        fetchForecast();
    }, [transactions]); // Re-fetch when transactions change

    const fetchForecast = async () => {
        try {
            const response = await fetch(`/api/smart/forecast?days=${days}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setForecastData(data);
            }
        } catch (error) {
            console.error('Error fetching forecast:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="tech-card p-4">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={16} className="text-primary" />
                    <h3 className="font-black text-sm uppercase tracking-tight">Balance Forecast</h3>
                </div>
                <div className="h-64 bg-muted/30 animate-pulse" />
            </div>
        );
    }

    if (!forecastData) {
        return null;
    }

    // Prepare chart data (sample every few days for readability)
    const sampleInterval = selectedPeriod === 30 ? 3 : selectedPeriod === 60 ? 5 : 7;
    const chartData = forecastData.projections
        .filter((_, index) => index % sampleInterval === 0)
        .slice(0, Math.ceil(selectedPeriod / sampleInterval))
        .map((proj, index) => ({
            day: index * sampleInterval,
            date: new Date(proj.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            balance: proj.balance,
            optimistic: forecastData.optimistic[index * sampleInterval]?.balance || proj.balance,
            pessimistic: forecastData.pessimistic[index * sampleInterval]?.balance || proj.balance
        }));

    const summary = forecastData.summary;
    const trend = selectedPeriod === 30 ? summary.projected30Day - summary.currentBalance :
        selectedPeriod === 60 ? summary.projected60Day - summary.currentBalance :
            summary.projected90Day - summary.currentBalance;

    return (
        <div className="tech-card p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-primary" />
                    <h3 className="font-black text-sm uppercase tracking-tight">Balance Forecast</h3>
                </div>

                {/* Period Selector */}
                <div className="flex items-center gap-1 bg-muted p-1">
                    {[30, 60, 90].map(period => (
                        <button
                            key={period}
                            onClick={() => setSelectedPeriod(period)}
                            className={`
                mono text-[10px] px-2 py-1 transition-colors font-bold
                ${selectedPeriod === period
                                    ? 'bg-primary text-background'
                                    : 'text-secondary hover:text-foreground'}
              `}
                        >
                            {period}D
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-muted/30 p-2 border border-border">
                    <div className="mono text-[9px] text-secondary/60 uppercase tracking-wider mb-1">
                        Current
                    </div>
                    <div className="font-black text-sm">
                        ${summary.currentBalance.toFixed(2)}
                    </div>
                </div>

                <div className="bg-muted/30 p-2 border border-border">
                    <div className="mono text-[9px] text-secondary/60 uppercase tracking-wider mb-1">
                        {selectedPeriod}D Projected
                    </div>
                    <div className={`font-black text-sm ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${(selectedPeriod === 30 ? summary.projected30Day :
                            selectedPeriod === 60 ? summary.projected60Day :
                                summary.projected90Day).toFixed(2)}
                    </div>
                </div>

                <div className="bg-muted/30 p-2 border border-border">
                    <div className="mono text-[9px] text-secondary/60 uppercase tracking-wider mb-1">
                        Change
                    </div>
                    <div className={`font-black text-sm flex items-center gap-1 ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        ${Math.abs(trend).toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis
                            dataKey="date"
                            stroke="hsl(var(--secondary))"
                            style={{ fontSize: '10px', fontFamily: 'monospace' }}
                            tick={{ fill: 'hsl(var(--secondary))' }}
                        />
                        <YAxis
                            stroke="hsl(var(--secondary))"
                            style={{ fontSize: '10px', fontFamily: 'monospace' }}
                            tick={{ fill: 'hsl(var(--secondary))' }}
                            tickFormatter={(value) => `$${value.toFixed(0)}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '0',
                                fontSize: '11px',
                                fontFamily: 'monospace'
                            }}
                            formatter={(value) => [`$${value.toFixed(2)}`, '']}
                        />
                        <Area
                            type="monotone"
                            dataKey="optimistic"
                            stroke="hsl(var(--primary))"
                            strokeOpacity={0.3}
                            fill="none"
                            strokeDasharray="3 3"
                        />
                        <Area
                            type="monotone"
                            dataKey="balance"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            fill="url(#balanceGradient)"
                        />
                        <Area
                            type="monotone"
                            dataKey="pessimistic"
                            stroke="hsl(var(--primary))"
                            strokeOpacity={0.3}
                            fill="none"
                            strokeDasharray="3 3"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Alerts */}
            {forecastData.alerts && forecastData.alerts.length > 0 && (
                <div className="space-y-2 mb-4">
                    {forecastData.alerts.map((alert, index) => (
                        <div
                            key={index}
                            className={`
                p-2 border-l-2 flex items-start gap-2
                ${alert.severity === 'warning'
                                    ? 'bg-yellow-500/10 border-yellow-500'
                                    : 'bg-blue-500/10 border-blue-500'}
              `}
                        >
                            <AlertTriangle size={14} className={`
                mt-0.5 flex-shrink-0
                ${alert.severity === 'warning' ? 'text-yellow-400' : 'text-blue-400'}
              `} />
                            <div>
                                <div className="mono text-[9px] uppercase tracking-wider mb-0.5 font-bold">
                                    {alert.type.replace('_', ' ')}
                                </div>
                                <div className="text-[11px] text-secondary/90">
                                    {alert.message}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer Stats */}
            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border">
                <div>
                    <div className="mono text-[9px] text-secondary/60 uppercase tracking-wider mb-1">
                        Avg Daily Income
                    </div>
                    <div className="text-xs font-bold text-green-400">
                        +${summary.avgDailyIncome.toFixed(2)}
                    </div>
                </div>
                <div>
                    <div className="mono text-[9px] text-secondary/60 uppercase tracking-wider mb-1">
                        Avg Daily Expenses
                    </div>
                    <div className="text-xs font-bold text-red-400">
                        -${summary.avgDailyExpenses.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-center gap-4 mono text-[9px] text-secondary/60">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-0.5 bg-primary" />
                        <span>Projected</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-0.5 bg-primary opacity-30 border-dashed" />
                        <span>Confidence Band</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForecastChart;
