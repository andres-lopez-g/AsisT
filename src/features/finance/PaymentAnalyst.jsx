import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calculator, CreditCard, Calendar, TrendingUp, Info, Save, ChevronRight, Check, AlertCircle, ArrowRight, AppWindow } from 'lucide-react';

const PaymentAnalyst = () => {
    const { authFetch } = useAuth();
    const [purchaseValue, setPurchaseValue] = useState('');
    const [installments, setInstallments] = useState('12');
    const [interestRate, setInterestRate] = useState('0');
    const [interestType, setInterestType] = useState('monthly'); // monthly or annual
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [title, setTitle] = useState('');
    const [dueDay, setDueDay] = useState('1');
    const [showInterestInfo, setShowInterestInfo] = useState(false);

    const analysis = useMemo(() => {
        const principal = parseFloat(purchaseValue) || 0;
        if (principal <= 0) return null;

        const n = parseInt(installments) || 1;
        let r = parseFloat(interestRate) || 0;

        // Convert rate to decimal and ensure it's monthly
        if (interestType === 'annual') {
            r = r / 12 / 100;
        } else {
            r = r / 100;
        }

        let monthlyPayment = 0;
        let totalInterest = 0;
        let totalCost = 0;

        if (r === 0) {
            monthlyPayment = principal / n;
            totalCost = principal;
        } else {
            // Formula: M = P [ r(1 + r)^n ] / [ (1 + r)^n - 1 ]
            monthlyPayment = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            totalCost = monthlyPayment * n;
            totalInterest = totalCost - principal;
        }

        return {
            monthlyPayment: monthlyPayment.toFixed(2),
            totalInterest: totalInterest.toFixed(2),
            totalCost: totalCost.toFixed(2),
            isFair: r === 0,
            interestPercentage: ((totalInterest / principal) * 100).toFixed(1)
        };
    }, [purchaseValue, installments, interestRate, interestType]);

    const handleSaveDebt = async () => {
        if (!analysis || !title) return;
        setIsSaving(true);
        setSaveError('');
        try {
            const res = await authFetch('/api/debts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title,
                    total_amount: analysis.totalCost,
                    interest_rate: interestRate,
                    installments_total: parseInt(installments),
                    start_date: new Date().toISOString().split('T')[0],
                    due_day: parseInt(dueDay)
                })
            });

            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
                setTitle('');
            } else {
                const data = await res.json();
                setSaveError(data.error || 'Failed to save debt');
            }
        } catch (err) {
            console.error('Failed to save debt:', err);
            setSaveError('Network error or server unavailable');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-8 md:p-12 space-y-12 max-w-5xl mx-auto">
            {/* Header Module */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b-2 border-primary/10">
                <div className="space-y-1">
                    <p className="mono text-xs font-bold text-accent uppercase tracking-[0.3em]">Module: Vector_Analysis</p>
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic text-primary">Analyst</h1>
                </div>
                <div className="flex items-center gap-2 bg-muted/30 border border-border p-1">
                    <div className="px-4 py-2 mono text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center gap-2">
                        <Calculator size={14} className="text-accent" />
                        <span>Credit_Vector_Probe</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Input Control Panel */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                        <h2 className="mono text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Input_Parameters</h2>
                        <Info size={14} className="text-secondary/60" />
                    </div>

                    <div className="tech-card p-6 space-y-6 bg-card relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <CreditCard size={64} />
                        </div>

                        <div className="space-y-2">
                            <label className="mono text-[10px] font-bold text-accent uppercase tracking-widest pl-1">Principal_Value</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 mono text-secondary font-bold">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full bg-muted/30 border border-border rounded-none p-4 pl-8 text-lg focus:border-accent outline-none mono font-bold text-primary placeholder:text-secondary/20 transition-all"
                                    value={purchaseValue}
                                    onChange={e => setPurchaseValue(e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="mono text-[10px] font-bold text-secondary uppercase tracking-widest pl-1">Term_Length</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full bg-muted/30 border border-border rounded-none p-3 text-sm focus:border-accent outline-none mono font-bold"
                                    value={installments}
                                    onChange={e => setInstallments(e.target.value)}
                                    placeholder="12"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="mono text-[10px] font-bold text-secondary uppercase tracking-widest pl-1">Interest_Idx</label>
                                    <button onClick={() => setShowInterestInfo(!showInterestInfo)} className="text-accent hover:text-primary transition-colors">
                                        <Info size={10} />
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full bg-muted/30 border border-border rounded-none p-3 text-sm focus:border-accent outline-none mono font-bold"
                                        value={interestRate}
                                        onChange={e => setInterestRate(e.target.value)}
                                        placeholder="0.00"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 mono text-[10px] text-secondary font-bold">%</span>
                                </div>
                            </div>
                        </div>

                        {showInterestInfo && (
                            <div className="p-3 bg-accent/5 border border-accent/20 mono text-[9px] text-secondary leading-relaxed">
                                <strong className="text-accent">NOTE:</strong> Verify if rate is Monthly or E.A. (Effective Annual). E.A. includes compound effects.
                            </div>
                        )}

                        <div className="space-y-2 pt-2">
                            <label className="mono text-[10px] font-bold text-secondary uppercase tracking-widest pl-1">Cycle_Type</label>
                            <div className="grid grid-cols-2 gap-px bg-border/40 border border-border/40">
                                <button
                                    onClick={() => setInterestType('monthly')}
                                    className={`py-3 mono text-[9px] font-bold uppercase tracking-widest transition-all ${interestType === 'monthly' ? 'bg-primary text-white' : 'bg-background text-secondary hover:text-primary'}`}
                                >
                                    Monthly_Rate
                                </button>
                                <button
                                    onClick={() => setInterestType('annual')}
                                    className={`py-3 mono text-[9px] font-bold uppercase tracking-widest transition-all ${interestType === 'annual' ? 'bg-primary text-white' : 'bg-background text-secondary hover:text-primary'}`}
                                >
                                    E.A._Annual
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analysis Output */}
                <div className="lg:col-span-7 space-y-6 flex flex-col">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                        <h2 className="mono text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Projection_Logic</h2>
                        {analysis && <span className="mono text-[9px] text-accent font-bold uppercase tracking-widest">Calculated</span>}
                    </div>

                    {!analysis ? (
                        <div className="flex-1 border-2 border-dashed border-border/40 flex flex-col items-center justify-center p-12 text-center space-y-4 opacity-50">
                            <TrendingUp size={48} className="text-secondary/40" />
                            <p className="mono text-xs text-secondary uppercase tracking-[0.2em]">Awaiting_Input_Vectors</p>
                        </div>
                    ) : (
                        <div className="flex-1 space-y-6">
                            {/* Primary Metric */}
                            <div className="bg-primary text-white p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.1)] flex justify-between items-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                                <div className="relative z-10">
                                    <p className="mono text-[10px] text-white/60 uppercase tracking-[0.2em] mb-1">Monthly_Obligation</p>
                                    <h3 className="text-5xl font-black italic tracking-tighter">${analysis.monthlyPayment}</h3>
                                </div>
                                <div className="relative z-10 w-12 h-12 border border-white/20 flex items-center justify-center">
                                    <ArrowRight size={20} className="text-white group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>

                            {/* Secondary Metrics */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="tech-card p-6 bg-background hover:border-accent/40 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <p className="mono text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Total_Cost</p>
                                        <Check size={14} className="text-secondary/40" />
                                    </div>
                                    <p className="text-2xl font-black text-primary tracking-tight">${analysis.totalCost}</p>
                                </div>
                                <div className={`tech-card p-6 bg-background transition-colors ${parseFloat(analysis.totalInterest) > 0 ? 'hover:border-red-500/40' : 'hover:border-green-500/40'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <p className="mono text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Interest_Delta</p>
                                        {parseFloat(analysis.totalInterest) > 0 ? <TrendingUp size={14} className="text-red-500" /> : <AppWindow size={14} className="text-green-500" />}
                                    </div>
                                    <p className={`text-2xl font-black tracking-tight ${parseFloat(analysis.totalInterest) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        +${analysis.totalInterest}
                                    </p>
                                    <p className="mono text-[9px] text-secondary mt-1 uppercase tracking-widest">{analysis.interestPercentage}% Markup</p>
                                </div>
                            </div>

                            {/* Save Module */}
                            <div className="border-t border-border/40 pt-6">
                                <div className="flex gap-4">
                                    <input
                                        className="flex-1 bg-muted/30 border border-border rounded-none p-3 text-sm focus:border-accent outline-none mono"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="IDENTIFIER (E.G. NEW LAPTOP)"
                                    />
                                    <input
                                        type="number"
                                        min="1"
                                        max="31"
                                        className="w-20 bg-muted/30 border border-border rounded-none p-3 text-sm focus:border-accent outline-none mono text-center"
                                        value={dueDay}
                                        onChange={e => setDueDay(e.target.value)}
                                        placeholder="DAY"
                                        title="Due Day"
                                    />
                                    <button
                                        onClick={handleSaveDebt}
                                        disabled={isSaving || !title}
                                        className={`px-8 font-black text-sm uppercase italic tracking-widest transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.1)] flex items-center gap-2 ${saved ? 'bg-green-600 text-white' : 'bg-primary text-white hover:bg-accent'}`}
                                    >
                                        {saved ? 'Recorded' : 'Commit'}
                                        <Save size={14} />
                                    </button>
                                </div>
                                {saveError && (
                                    <div className="mt-3 mono text-[9px] text-red-600 flex items-center gap-2">
                                        <AlertCircle size={10} />
                                        <span>ERROR: {saveError}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentAnalyst;
