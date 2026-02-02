import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Plus,
    ArrowUpRight,
    ArrowDownLeft,
    Trash2,
    X,
    CreditCard,
    Edit3,
    Settings
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CategoryManager from './CategoryManager';
import ForecastChart from '../../components/ForecastChart';
import SpendingInsights from './SpendingInsights';
import { formatCurrency } from '../../utils/currency';

const StatCard = ({ label, amount, icon: Icon }) => (
    <div className="bg-background border border-border/60 p-6 flex flex-col justify-between h-full hover:border-accent/40 transition-colors group">
        <div className="flex items-start justify-between mb-2">
            <div>
                <p className="mono text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-2">{label}</p>
                <h3 className="mono text-3xl font-bold text-primary tracking-tighter group-hover:text-accent transition-colors">
                    {amount}
                </h3>
            </div>
            <div className="p-2 border border-border/40 bg-muted/20 text-secondary group-hover:text-accent group-hover:border-accent/20 transition-all">
                <Icon size={18} />
            </div>
        </div>
        <div className="h-px w-full bg-border/20 group-hover:bg-accent/10 transition-colors" />
    </div>
);

const TransactionModal = ({ isOpen, onClose, onAdd, onUpdate, editingTransaction, categories }) => {
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        type: 'expense',
        category: 'General',
        date: new Date().toISOString().split('T')[0],
        currency: 'USD'
    });

    const filteredCategories = categories.filter(c => c.type === formData.type);

    useEffect(() => {
        if (editingTransaction) {
            setFormData({
                title: editingTransaction.title || '',
                amount: editingTransaction.amount || '',
                type: editingTransaction.type || 'expense',
                category: editingTransaction.category || 'General',
                date: editingTransaction.date ? new Date(editingTransaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                currency: editingTransaction.currency || 'USD'
            });
        } else {
            setFormData({ title: '', amount: '', type: 'expense', category: 'General', date: new Date().toISOString().split('T')[0], currency: 'USD' });
        }
    }, [editingTransaction, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            ...formData,
            amount: parseFloat(formData.amount)
        };

        if (editingTransaction) {
            onUpdate(editingTransaction.id, data);
        } else {
            onAdd(data);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/20 backdrop-blur-[2px]">
            <div className="bg-background border-2 border-primary shadow-[10px_10px_0px_rgba(0,0,0,0.1)] w-full max-w-md p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex justify-between items-start mb-8 pb-4 border-b border-border/40">
                    <div className="space-y-1">
                        <p className="mono text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Transaction Form</p>
                        <h2 className="text-2xl font-black tracking-tight italic uppercase">{editingTransaction ? 'Edit Transaction' : 'New Transaction'}</h2>
                    </div>
                    <button onClick={onClose} className="text-secondary hover:text-primary transition-colors border border-border p-1">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="mono text-[10px] font-bold text-secondary uppercase tracking-widest pl-1">Description</label>
                        <input
                            required
                            className="w-full bg-muted/30 border border-border rounded-none p-3 text-sm focus:border-accent outline-none mono"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="TRANSACTION NAME"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="mono text-[10px] font-bold text-secondary uppercase tracking-widest pl-1">Amount</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                className="w-full bg-muted/30 border border-border rounded-none p-3 text-sm focus:border-accent outline-none mono font-bold"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="mono text-[10px] font-bold text-secondary uppercase tracking-widest pl-1">Currency</label>
                            <select
                                className="w-full bg-muted/30 border border-border rounded-none p-3 text-sm focus:border-accent outline-none mono appearance-none cursor-pointer"
                                value={formData.currency}
                                onChange={e => setFormData({ ...formData, currency: e.target.value })}
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="COP">COP ($)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="mono text-[10px] font-bold text-secondary uppercase tracking-widest pl-1">Type</label>
                            <select
                                className="w-full bg-muted/30 border border-border rounded-none p-3 text-sm focus:border-accent outline-none mono appearance-none cursor-pointer"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="expense">EXPENSE (-)</option>
                                <option value="income">INCOME (+)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="mono text-[10px] font-bold text-secondary uppercase tracking-widest pl-1">Category</label>
                            <select
                                className="w-full bg-muted/30 border border-border rounded-none p-3 text-sm focus:border-accent outline-none mono appearance-none cursor-pointer"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="General">GENERAL</option>
                                {filteredCategories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="mono text-[10px] font-bold text-secondary uppercase tracking-widest pl-1">Date</label>
                        <input
                            type="date"
                            required
                            className="w-full bg-muted/30 border border-border rounded-none p-3 text-sm focus:border-accent outline-none mono"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="w-full bg-primary text-white py-4 font-black text-sm uppercase italic tracking-widest hover:bg-accent transition-all">
                            {editingTransaction ? 'Update Transaction' : 'Save Transaction'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const FinanceDashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [debts, setDebts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [editingDebt, setEditingDebt] = useState(null);
    const [loading, setLoading] = useState(true);

    const { authFetch } = useAuth();

    // Fetch Transactions and Debts
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [txRes, debtRes, catRes] = await Promise.all([
                    authFetch('/api/finance'),
                    authFetch('/api/debts'),
                    authFetch('/api/categories')
                ]);

                if (txRes.ok) setTransactions(await txRes.json());
                if (debtRes.ok) setDebts(await debtRes.json());
                if (catRes.ok) setCategories(await catRes.json());
            } catch (err) {
                console.error('Failed to fetch finance data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const addTransaction = async (tx) => {
        try {
            const res = await authFetch('/api/finance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tx)
            });

            if (res.ok) {
                const newTx = await res.json();
                setTransactions([newTx, ...transactions]);
            }
        } catch (err) {
            console.error('Failed to add transaction:', err);
        }
    };

    const updateTransaction = async (id, tx) => {
        try {
            const res = await authFetch(`/api/finance/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tx)
            });

            if (res.ok) {
                const updatedTx = await res.json();
                setTransactions(transactions.map(t => t.id === id ? updatedTx : t));
            }
        } catch (err) {
            console.error('Failed to update transaction:', err);
        }
    };

    const deleteTransaction = async (id) => {
        try {
            const res = await authFetch(`/api/finance/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setTransactions(transactions.filter(t => t.id !== id));
            }
        } catch (err) {
            console.error('Failed to delete transaction:', err);
        }
    };

    const addCategory = async (cat) => {
        try {
            const res = await authFetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cat)
            });

            if (res.ok) {
                const newCat = await res.json();
                setCategories([...categories, newCat]);
            }
        } catch (err) {
            console.error('Failed to add category:', err);
        }
    };

    const deleteCategory = async (id) => {
        try {
            const res = await authFetch(`/api/categories/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setCategories(categories.filter(c => c.id !== id));
            }
        } catch (err) {
            console.error('Failed to delete category:', err);
        }
    };

    const updateDebt = async (id, data) => {
        try {
            const res = await authFetch(`/api/debts/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                const updatedDebt = await res.json();
                setDebts(debts.map(d => d.id === id ? updatedDebt : d));
            }
        } catch (err) {
            console.error('Failed to update debt:', err);
        }
    };

    const payDebt = async (debtId, amount) => {
        try {
            const res = await authFetch(`/api/debts/${debtId}/payments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    payment_date: new Date().toISOString().split('T')[0]
                })
            });

            if (res.ok) {
                const updatedDebt = await res.json();
                setDebts(debts.map(d => d.id === debtId ? updatedDebt : d));

                // Fetch transactions again to show the payment
                const txRes = await authFetch('/api/finance');
                if (txRes.ok) setTransactions(await txRes.json());
            }
        } catch (err) {
            console.error('Failed to process debt payment:', err);
        }
    };

    // Derived State
    const stats = useMemo(() => {
        const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
        const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
        const totalDebt = debts.reduce((acc, d) => acc + (parseFloat(d.remaining_amount) || 0), 0);
        const balance = income - expenses;
        return { income, expenses, balance, totalDebt };
    }, [transactions, debts]);

    // Calculate Chart Data based on actual transactions
    const chartData = useMemo(() => {
        const data = [];
        const days = 7;
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

            const balanceAtDate = transactions
                .filter(t => t.date && new Date(t.date) <= d)
                .reduce((acc, t) => t.type === 'income' ? acc + (parseFloat(t.amount) || 0) : acc - (parseFloat(t.amount) || 0), 0);

            data.push({
                name: dayName,
                value: balanceAtDate,
                date: dateStr
            });
        }
        return data;
    }, [transactions]);


    return (
        <div className="p-8 md:p-12 space-y-12 max-w-7xl mx-auto">
            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingTransaction(null);
                }}
                onAdd={addTransaction}
                onUpdate={updateTransaction}
                editingTransaction={editingTransaction}
                categories={categories}
            />

            <CategoryManager
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                categories={categories}
                onAdd={addCategory}
                onDelete={deleteCategory}
            />

            {/* Header Module */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b-2 border-primary/10">
                <div className="space-y-1">
                    <p className="mono text-xs font-bold text-accent uppercase tracking-[0.3em]">Module: Capital_Ledger</p>
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic text-primary">Capital</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="flex items-center gap-2 mono text-[10px] font-bold text-secondary uppercase tracking-[0.2em] border border-border px-4 py-3 hover:bg-muted transition-colors"
                    >
                        <Settings size={14} />
                        <span>Categories</span>
                    </button>
                    <button
                        onClick={() => {
                            setEditingTransaction(null);
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 mono text-[10px] font-bold text-white bg-primary uppercase tracking-[0.2em] px-6 py-3 hover:bg-accent transition-colors shadow-[4px_4px_0px_rgba(0,0,0,0.1)]"
                    >
                        <Plus size={14} />
                        <span>Add Transaction</span>
                    </button>
                </div>
            </div>

            {/* Stats Instrument Array */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-border/40 border border-border/40">
                <div className="bg-background">
                    <StatCard
                        label="Balance"
                        amount={`$${stats.balance.toFixed(2)}`}
                        icon={DollarSign}
                    />
                </div>
                <div className="bg-background">
                    <StatCard
                        label="Total Income"
                        amount={`$${stats.income.toFixed(2)}`}
                        icon={ArrowUpRight}
                    />
                </div>
                <div className="bg-background">
                    <StatCard
                        label="Total Expenses"
                        amount={`$${stats.expenses.toFixed(2)}`}
                        icon={ArrowDownLeft}
                    />
                </div>
                <div className="bg-background">
                    <StatCard
                        label="Liabilities"
                        amount={`$${stats.totalDebt.toFixed(2)}`}
                        icon={TrendingDown}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Visual Analysis Module */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="mono text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Flux_Trajectory</h2>
                    </div>
                    <div className="border border-border/60 p-8 min-h-[400px] bg-muted/5 relative">
                        <div className="absolute top-4 right-4 mono text-[8px] text-secondary/40 uppercase tracking-[0.2em]">Sample_Interval: 7D</div>
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="rgb(var(--accent))" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="rgb(var(--accent))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="2 2" stroke="rgb(var(--border) / 0.4)" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={{ stroke: 'rgb(var(--border) / 0.6)' }}
                                        tickLine={false}
                                        tick={{ fill: 'rgb(var(--secondary))', fontSize: 9, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={{ stroke: 'rgb(var(--border) / 0.6)' }}
                                        tickLine={false}
                                        tick={{ fill: 'rgb(var(--secondary))', fontSize: 9, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgb(var(--background))',
                                            border: '1px solid rgb(var(--primary))',
                                            borderRadius: '0px',
                                            boxShadow: '4px 4px 0px rgba(0,0,0,0.1)',
                                            fontFamily: "'Space Grotesk', sans-serif",
                                            fontWeight: 500,
                                            fontSize: '10px'
                                        }}
                                        cursor={{ stroke: 'rgb(var(--accent))', strokeWidth: 1 }}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="rgb(var(--accent))" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Audit Log Module */}
                <div className="space-y-6 flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between">
                        <h2 className="mono text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Transaction_Audit</h2>
                    </div>
                    <div className="flex-1 border border-border/60 bg-background overflow-hidden flex flex-col">
                        <div className="overflow-auto divide-y divide-border/40">
                            {transactions.length === 0 ? (
                                <div className="p-12 text-center text-secondary mono text-[10px] uppercase tracking-widest">
                                    {loading ? 'Scanning_Database...' : 'Null_Entries'}
                                </div>
                            ) : (
                                transactions.map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className={`mono text-[10px] font-black w-6 h-6 border flex items-center justify-center ${tx.type === 'income' ? 'border-green-500/40 text-green-600 bg-green-50/50' : 'border-red-500/40 text-red-600 bg-red-50/50'}`}>
                                                {tx.type === 'income' ? '+' : '-'}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-primary text-xs truncate uppercase tracking-tight">{tx.title}</h4>
                                                <p className="mono text-[8px] text-secondary uppercase tracking-widest mt-0.5">
                                                    {tx.category} • {new Date(tx.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 pl-4">
                                            <span className={`mono text-xs font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-primary'}`}>
                                                {formatCurrency(tx.amount, tx.currency || 'USD')}
                                            </span>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setEditingTransaction(tx);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-1.5 border border-border hover:border-accent hover:text-accent transition-colors"
                                                >
                                                    <Edit3 size={12} />
                                                </button>
                                                <button onClick={() => deleteTransaction(tx.id)} className="p-1.5 border border-border hover:border-red-500 hover:text-red-500 transition-colors">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Liability Array Module */}
            <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <h2 className="mono text-[10px] font-bold text-secondary uppercase tracking-[0.2em] flex items-center gap-3">
                        <CreditCard size={14} className="text-accent" />
                        Active_Liabilities & Recurring_Cycles
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/40 border border-border/40">
                    {debts.length === 0 ? (
                        <div className="col-span-full py-16 text-center bg-background mono text-[10px] text-secondary uppercase tracking-[0.2em]">
                            System_Clear: No_Active_Liabilities
                        </div>
                    ) : (
                        debts.map(debt => {
                            const installmentAmount = (parseFloat(debt.total_amount) / debt.installments_total).toFixed(2);
                            const progress = (debt.installments_paid / debt.installments_total) * 100;

                            return (
                                <div key={debt.id} className="bg-background p-8 group hover:bg-muted/10 transition-colors">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-sm font-black uppercase italic tracking-tight">{debt.title}</h3>
                                                <button
                                                    onClick={() => {
                                                        setEditingDebt(debt);
                                                        setIsDebtModalOpen(true);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 border border-border hover:border-accent hover:text-accent"
                                                >
                                                    <Edit3 size={10} />
                                                </button>
                                            </div>
                                            <p className="mono text-[9px] text-secondary uppercase tracking-[0.1em]">Rate: {debt.interest_rate}%</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="mono text-lg font-bold text-primary tracking-tighter">{formatCurrency(debt.remaining_amount, debt.currency || 'USD')}</p>
                                            <p className="mono text-[8px] text-secondary uppercase tracking-[0.2em]">REMAINING</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <div className="flex justify-between mono text-[9px] font-bold uppercase text-secondary tracking-widest">
                                                <span>Cycle_Completion</span>
                                                <span className="text-primary">{debt.installments_paid} // {debt.installments_total} units</span>
                                            </div>
                                            <div className="w-full h-1 bg-border/30 overflow-hidden rounded-none">
                                                <div
                                                    className="h-full bg-accent transition-all duration-1000"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4 pt-4 border-t border-border/20">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="mono text-[8px] text-secondary uppercase tracking-[0.2em]">Scheduled_Inflow</p>
                                                    <p className="mono text-sm font-bold">{formatCurrency(installmentAmount, debt.currency || 'USD')}</p>
                                                </div>
                                                <div className="w-24">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        className="w-full bg-muted/40 border border-border rounded-none px-3 py-2 mono text-[10px] focus:border-accent outline-none"
                                                        placeholder="VALUE"
                                                        defaultValue={installmentAmount}
                                                        id={`amount-${debt.id}`}
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const val = document.getElementById(`amount-${debt.id}`).value;
                                                    payDebt(debt.id, val || installmentAmount);
                                                }}
                                                disabled={debt.installments_paid >= debt.installments_total}
                                                className="w-full bg-primary text-white mono text-[10px] font-bold py-3 uppercase tracking-widest hover:bg-accent disabled:opacity-20 transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.1)]"
                                            >
                                                {debt.installments_paid >= debt.installments_total ? 'SYSTEM_FINALIZED' : `Cycle_${debt.installments_paid + 1}_Commit`}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Protocol Edit Modal */}
            {isDebtModalOpen && editingDebt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/20 backdrop-blur-[2px]">
                    <div className="bg-background border-2 border-primary shadow-[10px_10px_0px_rgba(0,0,0,0.1)] w-full max-w-sm p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex justify-between items-start mb-8 pb-4 border-b border-border/40">
                            <div className="space-y-1">
                                <p className="mono text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Protocol adjustment</p>
                                <h2 className="text-xl font-black tracking-tight italic uppercase">Modify_Liability</h2>
                            </div>
                            <button onClick={() => setIsDebtModalOpen(false)} className="text-secondary hover:text-primary transition-colors border border-border p-1">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="mono text-[10px] font-bold text-secondary uppercase tracking-widest pl-1">Label</label>
                                <input
                                    className="w-full bg-muted/30 border border-border rounded-none p-3 text-sm focus:border-accent outline-none mono uppercase"
                                    value={editingDebt.title}
                                    onChange={e => setEditingDebt({ ...editingDebt, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="mono text-[10px] font-bold text-secondary uppercase tracking-widest pl-1">Cycle_Trigger_Day (1-31)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="31"
                                    className="w-full bg-muted/30 border border-border rounded-none p-3 text-sm focus:border-accent outline-none mono"
                                    value={editingDebt.due_day}
                                    onChange={e => setEditingDebt({ ...editingDebt, due_day: parseInt(e.target.value) })}
                                />
                            </div>
                            <button
                                onClick={() => {
                                    updateDebt(editingDebt.id, { title: editingDebt.title, due_day: editingDebt.due_day });
                                    setIsDebtModalOpen(false);
                                }}
                                className="w-full bg-primary text-white py-4 font-black text-sm uppercase italic tracking-widest hover:bg-accent transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.1)]"
                            >
                                Confirm_Protocol
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Smart Features Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                <ForecastChart transactions={transactions} />
                <SpendingInsights />
            </div>
        </div>
    );
};

export default FinanceDashboard;
