import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calculator, CreditCard, Calendar, TrendingUp, Info, Save, ChevronRight, Check } from 'lucide-react';

const PaymentAnalyst = () => {
    const { authFetch } = useAuth();
    const [purchaseValue, setPurchaseValue] = useState('');
    const [installments, setInstallments] = useState('12');
    const [interestRate, setInterestRate] = useState('0');
    const [interestType, setInterestType] = useState('monthly'); // monthly or annual
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [title, setTitle] = useState('');

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
        try {
            const res = await authFetch('/api/debts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title,
                    total_amount: analysis.totalCost,
                    interest_rate: interestRate,
                    installments_total: installments,
                    start_date: new Date().toISOString().split('T')[0]
                })
            });

            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
                setTitle('');
            }
        } catch (err) {
            console.error('Failed to save debt:', err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6 md:p-10 space-y-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="border-b border-border pb-6">
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                    <Calculator className="text-primary" />
                    Payment Analyst
                </h1>
                <p className="text-secondary mt-2">Analyze credit card purchases and installment plans.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="minimal-card p-6 space-y-6">
                    <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider flex items-center gap-2">
                        <Info size={16} />
                        Input Parameters
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-secondary uppercase mb-1">Purchase Value ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full bg-muted/30 border border-border rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                                value={purchaseValue}
                                onChange={e => setPurchaseValue(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-secondary uppercase mb-1">Installments</label>
                                <select
                                    className="w-full bg-muted/30 border border-border rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                                    value={installments}
                                    onChange={e => setInstallments(e.target.value)}
                                >
                                    {[1, 3, 6, 12, 18, 24, 36].map(n => (
                                        <option key={n} value={n}>{n} cuotas</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-secondary uppercase mb-1">Interest Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full bg-muted/30 border border-border rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                                    value={interestRate}
                                    onChange={e => setInterestRate(e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-secondary uppercase mb-1">Rate Cycle</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setInterestType('monthly')}
                                    className={`flex-1 py-2 text-xs font-medium rounded-md border transition-all ${interestType === 'monthly' ? 'bg-primary text-white border-primary' : 'bg-transparent text-secondary border-border hover:bg-muted'}`}
                                >
                                    Monthly
                                </button>
                                <button
                                    onClick={() => setInterestType('annual')}
                                    className={`flex-1 py-2 text-xs font-medium rounded-md border transition-all ${interestType === 'annual' ? 'bg-primary text-white border-primary' : 'bg-transparent text-secondary border-border hover:bg-muted'}`}
                                >
                                    E.A. (Annual)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analysis Results */}
                <div className="flex flex-col gap-6">
                    {!analysis ? (
                        <div className="minimal-card p-6 flex flex-col items-center justify-center text-center h-full border-dashed border-2 stroke-muted">
                            <TrendingUp className="text-muted mb-4" size={48} />
                            <p className="text-secondary text-sm">Enter a purchase value to see the detailed financing analysis.</p>
                        </div>
                    ) : (
                        <>
                            <div className="minimal-card p-6 bg-primary/5 border-primary/20">
                                <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Plan Summary</h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end border-b border-primary/10 pb-2">
                                        <span className="text-secondary text-sm">Monthly Payment</span>
                                        <span className="text-2xl font-bold text-foreground font-mono">${analysis.monthlyPayment}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div>
                                            <p className="text-xs text-secondary mb-1">Total Cost</p>
                                            <p className="font-semibold text-sm">${analysis.totalCost}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-secondary mb-1">Total Interest</p>
                                            <p className={`font-semibold text-sm ${parseFloat(analysis.totalInterest) > 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                +${analysis.totalInterest}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-4 p-3 bg-white/50 rounded-lg border border-primary/10 text-xs">
                                        <p className="flex items-center gap-2 text-secondary">
                                            <Info size={14} className="text-primary" />
                                            {analysis.isFair
                                                ? "This is a 0% interest plan. No extra cost!"
                                                : `You are paying ${analysis.interestPercentage}% extra in interest.`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="minimal-card p-6 space-y-4">
                                <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider">Save to My Debts</h2>
                                <div className="flex flex-col gap-3">
                                    <input
                                        className="w-full bg-muted/30 border border-border rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="Name of purchase (e.g. New Laptop)"
                                    />
                                    <button
                                        onClick={handleSaveDebt}
                                        disabled={isSaving || !title}
                                        className={`w-full py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${saved ? 'bg-green-500 text-white' : 'bg-foreground text-background hover:opacity-90 disabled:opacity-50'}`}
                                    >
                                        {saved ? <><Check size={18} /> Saved!</> : isSaving ? 'Saving...' : <><Save size={18} /> Record as Active Debt</>}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentAnalyst;
