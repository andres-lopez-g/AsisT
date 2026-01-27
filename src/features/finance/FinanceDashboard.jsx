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

const StatCard = ({ label, amount, icon: Icon, trend, trendUp }) => (
    <div className="minimal-card p-6 flex flex-col justify-between h-full">
        <div className="flex items-start justify-between mb-4">
            <div>
                <p className="text-secondary text-sm font-medium mb-1">{label}</p>
                <h3 className="text-3xl font-bold text-foreground tracking-tight">
                    {amount}
                </h3>
            </div>
            <div className="p-2 bg-muted rounded-md text-secondary">
                <Icon size={20} />
            </div>
        </div>
    </div>
);

const TransactionModal = ({ isOpen, onClose, onAdd, onUpdate, editingTransaction, categories }) => {
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        type: 'expense',
        category: 'General',
        date: new Date().toISOString().split('T')[0]
    });

    const filteredCategories = categories.filter(c => c.type === formData.type);

    useEffect(() => {
        if (editingTransaction) {
            setFormData({
                title: editingTransaction.title || '',
                amount: editingTransaction.amount || '',
                type: editingTransaction.type || 'expense',
                category: editingTransaction.category || 'General',
                date: editingTransaction.date ? new Date(editingTransaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
            });
        } else {
            setFormData({ title: '', amount: '', type: 'expense', category: 'General', date: new Date().toISOString().split('T')[0] });
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
        setFormData({ title: '', amount: '', type: 'expense', category: 'General', date: new Date().toISOString().split('T')[0] });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold">{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
                    <button onClick={onClose} className="text-secondary hover:text-foreground">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-secondary uppercase mb-1">Title</label>
                        <input
                            required
                            className="w-full bg-muted/30 border border-border rounded p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Grocery Run"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-secondary uppercase mb-1">Amount</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                className="w-full bg-muted/30 border border-border rounded p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-secondary uppercase mb-1">Type</label>
                            <select
                                className="w-full bg-muted/30 border border-border rounded p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-secondary uppercase mb-1">Category</label>
                        <select
                            className="w-full bg-muted/30 border border-border rounded p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="General">General</option>
                            {filteredCategories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-secondary uppercase mb-1">Date</label>
                        <input
                            type="date"
                            required
                            className="w-full bg-muted/30 border border-border rounded p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="w-full bg-primary text-white py-2 rounded-md font-medium text-sm mt-4 hover:opacity-90 transition-opacity">
                        {editingTransaction ? 'Update Transaction' : 'Save Transaction'}
                    </button>
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
        <div className="p-6 md:p-10 space-y-8 max-w-6xl mx-auto">
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

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Finance</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-secondary hover:text-foreground px-4 py-2 rounded-md font-medium transition-all text-sm border border-border"
                        title="Manage Categories"
                    >
                        <Settings size={16} />
                        <span>Categorías</span>
                    </button>
                    <button
                        onClick={() => {
                            setEditingTransaction(null);
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md font-medium transition-all text-sm shadow-sm"
                    >
                        <Plus size={16} />
                        <span>New Transaction</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    label="Current Balance"
                    amount={`$${stats.balance.toFixed(2)}`}
                    icon={DollarSign}
                />
                <StatCard
                    label="Income"
                    amount={`$${stats.income.toFixed(2)}`}
                    icon={ArrowUpRight}
                />
                <StatCard
                    label="Expenses"
                    amount={`$${stats.expenses.toFixed(2)}`}
                    icon={ArrowDownLeft}
                />
                <StatCard
                    label="Total Debt"
                    amount={`$${stats.totalDebt.toFixed(2)}`}
                    icon={TrendingDown}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="minimal-card p-6 lg:col-span-2 min-h-[400px]">
                    <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-6">Overview</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 10 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 10 }}
                                    tickFormatter={(value) => `$${Intl.NumberFormat('en', { notation: 'compact' }).format(value)}`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`$${value.toLocaleString()}`, 'Balance']}
                                />
                                <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="minimal-card p-0 flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b border-border bg-muted/30">
                        <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider">Transactions</h2>
                    </div>
                    <div className="overflow-auto max-h-[400px] divide-y divide-border">
                        {transactions.length === 0 ? (
                            <div className="p-8 text-center text-secondary text-sm">
                                {loading ? 'Loading...' : 'No transactions found.'}
                            </div>
                        ) : (
                            transactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold ${tx.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {tx.type === 'income' ? '+' : '-'}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-foreground text-sm">{tx.title}</h4>
                                            <p className="text-xs text-secondary">{new Date(tx.date).toLocaleDateString()} • {tx.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`font-medium text-sm ${tx.type === 'income' ? 'text-green-600' : 'text-foreground'}`}>
                                            {tx.type === 'income' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                                        </span>
                                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    setEditingTransaction(tx);
                                                    setIsModalOpen(true);
                                                }}
                                                className="text-secondary hover:text-primary p-1"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button onClick={() => deleteTransaction(tx.id)} className="text-secondary hover:text-red-500 p-1">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Debts Section */}
            <div className="minimal-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider flex items-center gap-2">
                        <CreditCard size={18} className="text-primary" />
                        Active Debts & Installments
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {debts.length === 0 ? (
                        <div className="col-span-full py-10 text-center text-secondary text-sm bg-muted/20 rounded-lg border border-dashed border-border">
                            No active debts. Use the Payment Analyst to record one.
                        </div>
                    ) : (
                        debts.map(debt => {
                            const installmentAmount = (parseFloat(debt.total_amount) / debt.installments_total).toFixed(2);
                            const progress = (debt.installments_paid / debt.installments_total) * 100;

                            return (
                                <div key={debt.id} className="border border-border rounded-lg p-5 hover:border-primary/30 transition-colors bg-background">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 group/title">
                                                <h3 className="font-bold text-foreground">{debt.title}</h3>
                                                <button
                                                    onClick={() => {
                                                        setEditingDebt(debt);
                                                        setIsDebtModalOpen(true);
                                                    }}
                                                    className="opacity-0 group-hover/title:opacity-100 transition-opacity text-secondary hover:text-primary"
                                                >
                                                    <Edit3 size={12} />
                                                </button>
                                            </div>
                                            <p className="text-xs text-secondary">Interest: {debt.interest_rate}%</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-primary">${parseFloat(debt.remaining_amount).toFixed(2)}</p>
                                            <div className="flex flex-col items-end">
                                                <p className="text-[10px] text-secondary uppercase">Remaining</p>
                                                <span className="text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded mt-1">Día {debt.due_day}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-[10px] font-bold uppercase text-secondary">
                                                <span>Progress</span>
                                                <span>{debt.installments_paid} / {debt.installments_total} cuotas</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary transition-all duration-500"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 pt-2">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] text-secondary uppercase">Next Payment</p>
                                                    <p className="text-sm font-semibold">${installmentAmount}</p>
                                                </div>
                                                <div className="w-24">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        className="w-full bg-muted/50 border border-border rounded px-2 py-1 text-xs focus:ring-1 focus:ring-primary outline-none"
                                                        placeholder="Monto"
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
                                                className="w-full bg-foreground text-background text-xs py-2 rounded-md font-medium hover:opacity-90 disabled:opacity-30 transition-opacity"
                                            >
                                                {debt.installments_paid >= debt.installments_total ? 'Paid' : 'Pay Amount'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Simple Debt Edit Modal */}
            {isDebtModalOpen && editingDebt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                    <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold">Edit Debt Status</h2>
                            <button onClick={() => setIsDebtModalOpen(false)} className="text-secondary hover:text-foreground">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-secondary uppercase mb-1">Nombre</label>
                                <input
                                    className="w-full bg-muted/30 border border-border rounded p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                                    value={editingDebt.title}
                                    onChange={e => setEditingDebt({ ...editingDebt, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-secondary uppercase mb-1">Día de Pago (1-31)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="31"
                                    className="w-full bg-muted/30 border border-border rounded p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                                    value={editingDebt.due_day}
                                    onChange={e => setEditingDebt({ ...editingDebt, due_day: parseInt(e.target.value) })}
                                />
                            </div>
                            <button
                                onClick={() => {
                                    updateDebt(editingDebt.id, { title: editingDebt.title, due_day: editingDebt.due_day });
                                    setIsDebtModalOpen(false);
                                }}
                                className="w-full bg-primary text-white py-2 rounded-md font-medium text-sm mt-4 hover:opacity-90 transition-opacity"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceDashboard;
