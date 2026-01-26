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
                // Fetch Finances
                const finRes = await authFetch('/api/finance');
                if (finRes.ok) {
                    const trans = await finRes.json();
                    const income = trans.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
                    const expenses = trans.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
                    setFinances({ income, expenses, balance: income - expenses });
                }

                // Fetch Tasks
                const taskRes = await authFetch('/api/planner');
                if (taskRes.ok) {
                    const tasks = await taskRes.json();
                    setNextTasks(tasks.filter(t => t.status !== 'done').slice(0, 3));
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
        <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto h-full overflow-auto">
            {/* Welcome Section */}
            <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight text-foreground">
                    Hola, {user?.name.split(' ')[0]} 👋
                </h1>
                <p className="text-secondary text-lg">Aquí tienes un resumen de tu actividad para hoy.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Financial Summary */}
                <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="minimal-card p-6 flex flex-col justify-between bg-primary/5 border-primary/10">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-secondary text-sm font-medium mb-1">Balance Total</p>
                                <h3 className="text-4xl font-bold text-primary tracking-tight">
                                    ${finances.balance.toLocaleString()}
                                </h3>
                            </div>
                            <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                <DollarSign size={24} />
                            </div>
                        </div>
                        <div className="mt-6 flex gap-4">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                                <TrendingUp size={14} />
                                <span>+${finances.income.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                                <TrendingDown size={14} />
                                <span>-${finances.expenses.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="minimal-card p-6 flex flex-col justify-center gap-4 bg-muted/20">
                        <h4 className="font-semibold text-foreground">Estado Financiero</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-secondary">Ingresos Mensuales</span>
                                <span className="font-medium text-foreground">${finances.income.toLocaleString()}</span>
                            </div>
                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 rounded-full"
                                    style={{ width: finances.income > 0 ? '100%' : '0%' }}
                                />
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-secondary">Gastos Mensuales</span>
                                <span className="font-medium text-foreground">${finances.expenses.toLocaleString()}</span>
                            </div>
                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-red-500 rounded-full"
                                    style={{ width: finances.income > 0 ? `${(finances.expenses / finances.income) * 100}%` : '0%' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tasks Summary */}
                <div className="minimal-card p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                            <Calendar size={18} className="text-primary" />
                            Próximas Tareas
                        </h4>
                        <Link to="/planner" className="text-primary hover:underline text-xs font-medium flex items-center gap-1">
                            Ver todo <ArrowRight size={12} />
                        </Link>
                    </div>

                    <div className="space-y-3 flex-1">
                        {nextTasks.length > 0 ? (
                            nextTasks.map(task => (
                                <div key={task.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                                    {task.status === 'in-progress' ? (
                                        <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                                        </div>
                                    ) : (
                                        <Circle size={16} className="text-secondary group-hover:text-primary transition-colors" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                                        <p className="text-[10px] text-secondary">{task.date}</p>
                                    </div>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider
                                        ${task.priority === 'high' ? 'bg-red-100 text-red-600' :
                                            task.priority === 'medium' ? 'bg-orange-100 text-orange-600' :
                                                'bg-blue-100 text-blue-600'}`}>
                                        {task.priority}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-border rounded-lg">
                                <CheckCircle2 size={32} className="text-muted mb-2" />
                                <p className="text-xs text-secondary italic">¡Todo al día!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions / Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link to="/finance" className="group">
                    <div className="minimal-card p-6 hover:border-primary/30 transition-all">
                        <h5 className="font-bold text-foreground group-hover:text-primary transition-colors">Análisis Financiero Detallado</h5>
                        <p className="text-secondary text-sm mt-1">Revisa tus gráficos de ingresos y gastos, y gestiona tus movimientos.</p>
                    </div>
                </Link>
                <Link to="/planner" className="group">
                    <div className="minimal-card p-6 hover:border-primary/30 transition-all">
                        <h5 className="font-bold text-foreground group-hover:text-primary transition-colors">Gestión de Tareas</h5>
                        <p className="text-secondary text-sm mt-1">Organiza tu flujo de trabajo en el tablero Kanban y completa tus objetivos.</p>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default HomeView;
