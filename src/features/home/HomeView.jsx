import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    CheckCircle2,
    Circle,
    Calendar,
    ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const HomeView = () => {
    const { user, authFetch } = useAuth();
    const [finances, setFinances] = useState({ income: 0, expenses: 0, balance: 0 });
    const [nextTasks, setNextTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const finRes = await authFetch('/api/finance');
                if (finRes.ok) {
                    const trans = await finRes.json();
                    const income = trans.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
                    const expenses = trans.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
                    setFinances({ income, expenses, balance: income - expenses });
                }

                const taskRes = await authFetch('/api/planner');
                if (taskRes.ok) {
                    const tasks = await taskRes.json();
                    setNextTasks(tasks.filter(t => t.status !== 'done').slice(0, 4));
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="p-8 md:p-12 space-y-12 max-w-7xl mx-auto">
            {/* Header Module */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b-2 border-primary/10">
                <div className="space-y-1">
                    <p className="mono text-xs font-bold text-accent uppercase tracking-[0.3em]">System Status: Online</p>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic text-primary">
                        {user?.name ? user.name.split(' ')[0] : 'OPERATOR'}
                    </h1>
                </div>
                <div className="flex items-center gap-4 mono text-[10px] font-bold text-secondary uppercase tracking-widest bg-muted px-4 py-2 border border-border/50">
                    <Calendar size={12} />
                    <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Financial Instrument Module */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border/40 border border-border/40">
                        <div className="bg-background p-8 space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="mono text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-2">Total Capital</p>
                                    <h3 className="mono text-5xl font-bold text-primary tracking-tighter">
                                        ${finances.balance.toLocaleString()}
                                    </h3>
                                </div>
                                <div className="p-3 border border-border bg-muted/30">
                                    <DollarSign size={20} className="text-primary" />
                                </div>
                            </div>
                            <div className="flex gap-8 pt-4">
                                <div className="space-y-1">
                                    <span className="mono text-[9px] text-green-600 font-bold uppercase">Inflow</span>
                                    <div className="flex items-center gap-2 mono text-sm font-bold">
                                        <TrendingUp size={14} className="text-green-500" />
                                        <span>${finances.income.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="mono text-[9px] text-red-600 font-bold uppercase">Outflow</span>
                                    <div className="flex items-center gap-2 mono text-sm font-bold">
                                        <TrendingDown size={14} className="text-red-500" />
                                        <span>${finances.expenses.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-muted/10 p-8 flex flex-col justify-center gap-6">
                            <h4 className="mono text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Flow Distribution</h4>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between mono text-[10px] font-bold">
                                        <span>OPERATIONAL LIMIT</span>
                                        <span>100%</span>
                                    </div>
                                    <div className="h-1 bg-border/40 overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: '100%' }} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between mono text-[10px] font-bold">
                                        <span>CURRENT UTILIZATION</span>
                                        <span>{finances.income > 0 ? Math.round((finances.expenses / finances.income) * 100) : 0}%</span>
                                    </div>
                                    <div className="h-1 bg-border/40 overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${finances.expenses > finances.income ? 'bg-red-500' : 'bg-accent'}`}
                                            style={{ width: finances.income > 0 ? `${Math.min((finances.expenses / finances.income) * 100, 100)}%` : '0%' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Access Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border/40 border border-border/40">
                        <Link to="/finance" className="group bg-background p-8 hover:bg-muted/30 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <h5 className="text-lg font-black tracking-tight uppercase italic group-hover:text-accent transition-colors">Capital Ledger</h5>
                                <ArrowRight size={18} className="text-secondary group-hover:text-accent transition-transform group-hover:translate-x-1" />
                            </div>
                            <p className="text-secondary text-sm leading-relaxed">Full audit of all transaction cycles and liquidity reports.</p>
                        </Link>
                        <Link to="/planner" className="group bg-background p-8 hover:bg-muted/30 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <h5 className="text-lg font-black tracking-tight uppercase italic group-hover:text-accent transition-colors">Mission Control</h5>
                                <ArrowRight size={18} className="text-secondary group-hover:text-accent transition-transform group-hover:translate-x-1" />
                            </div>
                            <p className="text-secondary text-sm leading-relaxed">Strategic objective planning and operational execution board.</p>
                        </Link>
                    </div>
                </div>

                {/* Sidebar Module: Logistics */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="mono text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Next Objectives</h4>
                        <Link to="/planner" className="mono text-[9px] font-bold text-accent underline uppercase tracking-tighter">Expand</Link>
                    </div>

                    <div className="space-y-px bg-border/40 border border-border/40">
                        {nextTasks.length > 0 ? (
                            nextTasks.map(task => (
                                <div key={task.id} className="bg-background p-4 hover:bg-muted/20 transition-colors cursor-pointer group flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-1.5 h-1.5 rounded-full ${task.status === 'in-progress' ? 'bg-accent animate-pulse' : 'bg-secondary/40'}`} />
                                            <p className="text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">{task.title}</p>
                                        </div>
                                        <span className={`tech-tag ${task.priority === 'high' ? 'border-red-500 text-red-600 bg-red-50' :
                                                task.priority === 'medium' ? 'border-orange-500 text-orange-600 bg-orange-50' :
                                                    'border-accent text-accent bg-blue-50'
                                            }`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pl-4 mt-1 border-l border-border/60">
                                        <span className="mono text-[9px] text-secondary uppercase tracking-wider">{task.date}</span>
                                        <ArrowRight size={12} className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-background p-12 text-center">
                                <p className="mono text-[10px] text-secondary italic uppercase tracking-widest">No Active Missions</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeView;
