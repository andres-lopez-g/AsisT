import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calculator, CreditCard, Calendar, TrendingUp, Info, Save, ChevronRight, Check, AlertCircle } from 'lucide-react';

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
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full bg-muted/30 border border-border rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                                    value={installments}
                                    onChange={e => setInstallments(e.target.value)}
                                    placeholder="12"
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-semibold text-secondary uppercase">Interest Rate (%)</label>
                                    <button
                                        onClick={() => setShowInterestInfo(!showInterestInfo)}
                                        className="text-primary hover:text-primary/80 transition-colors"
                                        title="What is this?"
                                    >
                                        <Info size={14} />
                                    </button>
                                </div>
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

                        {showInterestInfo && (
                            <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg animate-in slide-in-from-top-2 duration-300">
                                <h4 className="text-xs font-bold text-primary uppercase mb-2">Monthly vs E.A. (Effective Annual)</h4>
                                <div className="space-y-2 text-xs text-secondary leading-relaxed">
                                    <p>
                                        <strong className="text-foreground">Monthly:</strong> The interest charged every month. For example, 2% monthly means you pay 2% of the balance each month.
                                    </p>
                                    <p>
                                        <strong className="text-foreground">E.A. (Annual):</strong> The real yearly cost. It considers compound interest. Usually, credit cards mention their "E.A." rate, which is higher than (Monthly rate × 12).
                                    </p>
                                </div>
                            </div>
                        )}

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
                                    {saveError && (
                                        <div className="p-2.5 bg-red-50 border border-red-100 rounded-md text-red-600 text-[10px] flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                                            <AlertCircle size={14} />
                                            <span>{saveError}</span>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-4 gap-3">
                                        <div className="col-span-3">
                                            <label className="block text-[10px] font-bold text-secondary uppercase mb-1 ml-1">Nombre de la compra</label>
                                            <input
                                                className="w-full bg-muted/30 border border-border rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                                                value={title}
                                                onChange={e => setTitle(e.target.value)}
                                                placeholder="Ej: Laptop nueva"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-[10px] font-bold text-secondary uppercase mb-1 ml-1">Día Pago</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="31"
                                                className="w-full bg-muted/30 border border-border rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                                                value={dueDay}
                                                onChange={e => setDueDay(e.target.value)}
                                                placeholder="1-31"
                                                title="Día del mes para el recordatorio de pago"
                                            />
                                        </div>
                                    </div>
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
