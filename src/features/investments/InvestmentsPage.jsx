import React from 'react';
import { Activity } from 'lucide-react';
import SmartInvestments from './SmartInvestments';

/**
 * InvestmentsPage - Dedicated page for market investments tracking
 * Displays top stocks and cryptocurrencies
 */
const InvestmentsPage = () => {
    return (
        <div className="p-8 md:p-12 space-y-12 max-w-7xl mx-auto">
            {/* Header Module */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b-2 border-primary/10">
                <div className="space-y-1">
                    <p className="mono text-xs font-bold text-accent uppercase tracking-[0.3em]">Module: Market_Intelligence</p>
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic text-primary">Investments</h1>
                    <p className="text-secondary text-sm mt-4">Track top performing stocks and cryptocurrencies in real-time</p>
                </div>
                <div className="flex items-center gap-2 mono text-[10px] text-secondary/60 uppercase tracking-wider border border-border px-4 py-2 bg-muted/30">
                    <Activity size={14} />
                    <span>Live Market Data</span>
                </div>
            </div>

            {/* Main Investments Display */}
            <div className="max-w-2xl mx-auto">
                <SmartInvestments />
            </div>

            {/* Info Footer */}
            <div className="border-t border-border pt-8 mt-16">
                <div className="max-w-3xl mx-auto space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-muted/30 border border-border p-4">
                            <h3 className="font-bold text-sm uppercase tracking-tight mb-2 text-primary">Market Updates</h3>
                            <p className="mono text-[10px] text-secondary/80">Data refreshed every 24 hours from trusted sources</p>
                        </div>
                        <div className="bg-muted/30 border border-border p-4">
                            <h3 className="font-bold text-sm uppercase tracking-tight mb-2 text-primary">Top Performers</h3>
                            <p className="mono text-[10px] text-secondary/80">Showing most actively traded stocks and cryptocurrencies</p>
                        </div>
                        <div className="bg-muted/30 border border-border p-4">
                            <h3 className="font-bold text-sm uppercase tracking-tight mb-2 text-primary">Real-Time Trends</h3>
                            <p className="mono text-[10px] text-secondary/80">7-day price charts for visual analysis</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvestmentsPage;
