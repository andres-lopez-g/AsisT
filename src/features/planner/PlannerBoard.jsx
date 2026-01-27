import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Plus,
    MoreHorizontal,
    Calendar as CalendarIcon,
    CheckCircle2,
    Circle,
    Clock,
    Layout,
    Trash2,
    X,
    Loader2,
    ChevronRight,
    AlertCircle,
    Edit3,
    Tag
} from 'lucide-react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    parseISO,
    getDate
} from 'date-fns';

const TaskCard = ({ task, onDelete, onStatusChange, onEdit }) => (
    <div className="bg-background border border-border/60 p-4 mb-3 hover:border-accent/40 transition-colors group relative">
        <div className="flex justify-between items-start mb-3">
            <div className="flex flex-wrap gap-2">
                <span className={`mono text-[9px] font-bold px-2 py-0.5 border uppercase tracking-widest
                    ${task.priority === 'high' ? 'border-red-500/30 text-red-600 bg-red-50/50' :
                        task.priority === 'medium' ? 'border-orange-500/30 text-orange-600 bg-orange-50/50' :
                            'border-blue-500/30 text-blue-600 bg-blue-50/50'}`}>
                    {task.priority}
                </span>
                {task.category && (
                    <span className="mono text-[9px] font-bold px-2 py-0.5 border border-border/40 text-secondary uppercase tracking-widest">
                        {task.category}
                    </span>
                )}
            </div>
            <div className="flex gap-2 bg-background border border-border/20 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onEdit(task)}
                    className="text-secondary hover:text-accent p-0.5 transition-colors"
                >
                    <Edit3 size={12} />
                </button>
                <button
                    onClick={() => onDelete(task.id)}
                    className="text-secondary hover:text-red-500 p-0.5 transition-colors"
                >
                    <Trash2 size={12} />
                </button>
            </div>
        </div>
        <h4 className="font-bold text-xs text-primary mb-4 leading-relaxed uppercase tracking-tight line-clamp-2">{task.title}</h4>
        <div className="flex items-center justify-between pt-3 border-t border-border/20">
            <div className="flex items-center mono text-[9px] text-secondary gap-2 uppercase tracking-widest">
                <CalendarIcon size={10} className="text-accent" />
                <span>{task.date}</span>
            </div>
            <div className="relative">
                <select
                    value={task.status}
                    onChange={(e) => onStatusChange(task.id, e.target.value)}
                    className="mono text-[8px] font-bold bg-muted/30 border border-border/40 px-2 py-1 focus:ring-0 cursor-pointer uppercase tracking-widest outline-none hover:border-accent/40 transition-colors"
                >
                    <option value="todo">TODO</option>
                    <option value="in-progress">ACTIVE</option>
                    <option value="done">COMPLETED</option>
                </select>
            </div>
        </div>
    </div>
);

const Column = ({ title, tasks, icon: Icon, colorClass, onDelete, onStatusChange, onAdd, onEdit }) => (
    <div className="flex-1 min-w-[320px] bg-muted/10 border border-border/40 p-4 h-full overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-primary/10">
            <div className="flex items-center gap-3">
                <div className={`p-2 border border-border/40 bg-background ${colorClass}`}>
                    <Icon size={14} />
                </div>
                <div className="space-y-0.5">
                    <h3 className="text-xs font-black uppercase italic tracking-widest text-primary">{title}</h3>
                    <p className="mono text-[8px] text-secondary font-bold tracking-[0.2em]">{tasks.length} OBJECTIVES_LOADED</p>
                </div>
            </div>
            <button
                onClick={onAdd}
                className="text-white bg-primary hover:bg-accent p-2 transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
            >
                <Plus size={14} />
            </button>
        </div>
        <div className="space-y-1 overflow-y-auto flex-1 pr-1 custom-scrollbar">
            {tasks.map(task => (
                <TaskCard
                    key={task.id}
                    task={task}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                    onEdit={onEdit}
                />
            ))}
            {tasks.length === 0 && (
                <div className="py-20 text-center mono text-[9px] text-secondary/40 border-2 border-dashed border-border/40 uppercase tracking-[0.3em]">
                    Objective_Null
                </div>
            )}
        </div>
    </div>
);

const TaskModal = ({ isOpen, onClose, onAdd, onUpdate, editingTask, categories }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [priority, setPriority] = useState('medium');
    const [status, setStatus] = useState('todo');
    const [category, setCategory] = useState('General');

    const taskCategories = categories.filter(c => c.type === 'task');

    useEffect(() => {
        if (editingTask) {
            setTitle(editingTask.title || '');
            setDate(editingTask.date || new Date().toISOString().split('T')[0]);
            setPriority(editingTask.priority || 'medium');
            setStatus(editingTask.status || 'todo');
            setCategory(editingTask.category || 'General');
        } else {
            setTitle('');
            setDate(new Date().toISOString().split('T')[0]);
            setPriority('medium');
            setStatus('todo');
            setCategory('General');
        }
    }, [editingTask, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = { title, date, priority, status, category };
        if (editingTask) {
            onUpdate(editingTask.id, data);
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
                        <p className="mono text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Strategy_Module</p>
                        <h2 className="text-2xl font-black tracking-tight italic uppercase">{editingTask ? 'Modify_Objective' : 'Initialize_Task'}</h2>
                    </div>
                    <button onClick={onClose} className="text-secondary hover:text-primary transition-colors border border-border p-1">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="mono text-[10px] font-bold text-secondary uppercase tracking-widest pl-1">Objective_Description</label>
                        <input
                            required
                            className="w-full bg-muted/30 border border-border rounded-none p-3 text-sm focus:border-accent outline-none mono"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="TASK IDENTIFIER"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="mono text-[10px] font-bold text-secondary uppercase tracking-widest pl-1">Target_Date</label>
                            <input
                                type="date"
                                required
                                className="w-full bg-muted/30 border border-border rounded-none p-3 text-sm focus:border-accent outline-none mono"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="mono text-[10px] font-bold text-secondary uppercase tracking-widest pl-1">Priority_Tier</label>
                            <select
                                className="w-full bg-muted/30 border border-border rounded-none p-3 text-sm focus:border-accent outline-none mono appearance-none cursor-pointer"
                                value={priority}
                                onChange={e => setPriority(e.target.value)}
                            >
                                <option value="low">LOW_PRIORITY</option>
                                <option value="medium">MEDIUM_PRIORITY</option>
                                <option value="high">CRITICAL_OBJ</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="mono text-[10px] font-bold text-secondary uppercase tracking-widest pl-1">Initial_State</label>
                            <select
                                className="w-full bg-muted/30 border border-border rounded-none p-3 text-sm focus:border-accent outline-none mono appearance-none cursor-pointer"
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                            >
                                <option value="todo">TODO_STACK</option>
                                <option value="in-progress">ACTIVE_EXEC</option>
                                <option value="done">COMPLETE_LOG</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="mono text-[10px] font-bold text-secondary uppercase tracking-widest pl-1">Category_Class</label>
                            <select
                                className="w-full bg-muted/30 border border-border rounded-none p-3 text-sm focus:border-accent outline-none mono appearance-none cursor-pointer"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            >
                                <option value="General">GENERAL</option>
                                {taskCategories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="w-full bg-primary text-white py-4 font-black text-sm uppercase italic tracking-widest hover:bg-accent transition-all">
                            {editingTask ? 'Commit_Update' : 'Initialize_Strategy'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PlannerBoard = () => {
    const [tasks, setTasks] = useState([]);
    const [debts, setDebts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [view, setView] = useState('kanban');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [defaultStatus, setDefaultStatus] = useState('todo');

    const { authFetch } = useAuth();

    const fetchData = async () => {
        try {
            const [tasksRes, debtsRes, catsRes] = await Promise.all([
                authFetch('/api/planner'),
                authFetch('/api/debts'),
                authFetch('/api/categories')
            ]);

            if (tasksRes.ok) setTasks(await tasksRes.json());
            if (debtsRes.ok) setDebts(await debtsRes.json());
            if (catsRes.ok) setCategories(await catsRes.json());
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const addTask = async (taskData) => {
        try {
            const res = await authFetch('/api/planner', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData)
            });
            if (res.ok) {
                const newTask = await res.json();
                setTasks([...tasks, newTask]);
            }
        } catch (err) {
            console.error('Failed to add task:', err);
        }
    };

    const updateTaskStatus = async (taskId, newStatus) => {
        try {
            const res = await authFetch(`/api/planner/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                const updated = await res.json();
                setTasks(tasks.map(t => t.id === taskId ? updated : t));
            }
        } catch (err) {
            console.error('Failed to update task status:', err);
        }
    };

    const updateTask = async (taskId, data) => {
        try {
            const res = await authFetch(`/api/planner/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                const updated = await res.json();
                setTasks(tasks.map(t => t.id === taskId ? updated : t));
            }
        } catch (err) {
            console.error('Failed to update task:', err);
        }
    };

    const deleteTask = async (taskId) => {
        try {
            const res = await authFetch(`/api/planner/${taskId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setTasks(tasks.filter(t => t.id !== taskId));
            }
        } catch (err) {
            console.error('Failed to delete task:', err);
        }
    };

    const todoTasks = tasks.filter(t => t.status === 'todo');
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
    const doneTasks = tasks.filter(t => t.status === 'done');

    const openAddModal = (status = 'todo') => {
        setDefaultStatus(status);
        setIsAddModalOpen(true);
    };

    if (loading) {
        return (
            <div className="p-6 md:p-10 flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    return (
        <div className="p-8 md:p-12 space-y-12 max-w-7xl mx-auto h-full flex flex-col">
            <TaskModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setEditingTask(null);
                }}
                onAdd={addTask}
                onUpdate={updateTask}
                editingTask={editingTask}
                categories={categories}
            />

            {/* Header Module */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b-2 border-primary/10">
                <div className="space-y-1">
                    <p className="mono text-xs font-bold text-accent uppercase tracking-[0.3em]">Module: Operational_Planner</p>
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic text-primary">Objectives</h1>
                </div>
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => openAddModal()}
                        className="bg-primary text-white p-3 md:hidden shadow-[4px_4px_0px_rgba(0,0,0,0.1)]"
                    >
                        <Plus size={20} />
                    </button>
                    <div className="flex bg-muted/30 border border-border p-1">
                        <button
                            onClick={() => setView('kanban')}
                            className={`px-6 py-2 mono text-[10px] font-bold transition-all flex items-center gap-3 uppercase tracking-widest ${view === 'kanban' ? 'bg-primary text-white' : 'text-secondary hover:text-primary hover:bg-muted'}`}
                        >
                            <Layout size={14} />
                            <span className="hidden sm:inline">Tactical_Board</span>
                        </button>
                        <button
                            onClick={() => setView('calendar')}
                            className={`px-6 py-2 mono text-[10px] font-bold transition-all flex items-center gap-3 uppercase tracking-widest ${view === 'calendar' ? 'bg-primary text-white' : 'text-secondary hover:text-primary hover:bg-muted'}`}
                        >
                            <CalendarIcon size={14} />
                            <span className="hidden sm:inline">Temporal_Grid</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Tactical Board View */}
            {view === 'kanban' && (
                <div className="flex gap-8 overflow-x-auto pb-6 h-full items-start scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                    <Column
                        title="Draft"
                        tasks={todoTasks}
                        icon={Circle}
                        colorClass="text-secondary"
                        onDelete={deleteTask}
                        onStatusChange={updateTaskStatus}
                        onAdd={() => openAddModal('todo')}
                        onEdit={(t) => { setEditingTask(t); setIsAddModalOpen(true); }}
                    />
                    <Column
                        title="Execution"
                        tasks={inProgressTasks}
                        icon={Clock}
                        colorClass="text-accent"
                        onDelete={deleteTask}
                        onStatusChange={updateTaskStatus}
                        onAdd={() => openAddModal('in-progress')}
                        onEdit={(t) => { setEditingTask(t); setIsAddModalOpen(true); }}
                    />
                    <Column
                        title="Archived"
                        tasks={doneTasks}
                        icon={CheckCircle2}
                        colorClass="text-green-600"
                        onDelete={deleteTask}
                        onStatusChange={updateTaskStatus}
                        onAdd={() => openAddModal('done')}
                        onEdit={(t) => { setEditingTask(t); setIsAddModalOpen(true); }}
                    />
                </div>
            )}

            {/* Temporal Grid View */}
            {view === 'calendar' && (
                <div className="flex-1 flex flex-col bg-background border border-border/60 overflow-hidden">
                    {/* Calendar Controls */}
                    <div className="flex items-center justify-between p-8 border-b border-border/40">
                        <div className="space-y-1">
                            <p className="mono text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Active_Timeline</p>
                            <h2 className="text-2xl font-black text-primary uppercase italic tracking-tight">
                                {format(currentMonth, 'MMMM_yyyy')}
                            </h2>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setCurrentMonth(new Date())}
                                className="px-4 py-2 mono text-[10px] font-bold border border-border hover:bg-muted uppercase tracking-widest text-secondary transition-colors"
                            >
                                Core_Time
                            </button>
                            <div className="flex border border-border">
                                <button
                                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                    className="p-3 hover:bg-muted border-r border-border transition-colors text-primary"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                    className="p-3 hover:bg-muted transition-colors text-primary"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Day labels */}
                    <div className="grid grid-cols-7 bg-muted/30 border-b border-border/40">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="py-4 text-center mono text-[9px] font-black uppercase tracking-[0.3em] text-secondary border-r last:border-r-0 border-border/20">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Grid Units */}
                    <div className="grid grid-cols-7 flex-1">
                        {(() => {
                            const monthStart = startOfMonth(currentMonth);
                            const monthEnd = endOfMonth(monthStart);
                            const startDate = startOfWeek(monthStart);
                            const endDate = endOfWeek(monthEnd);
                            const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

                            return calendarDays.map((date, i) => {
                                const dateStr = format(date, 'yyyy-MM-dd');
                                const dayTasks = tasks.filter(t => t.date === dateStr);
                                const dayDebts = debts.filter(d =>
                                    d.due_day === getDate(date) &&
                                    isSameMonth(date, currentMonth) &&
                                    parseInt(d.installments_paid) < parseInt(d.installments_total)
                                );
                                const isCurrentMonth = isSameMonth(date, currentMonth);

                                return (
                                    <div
                                        key={i}
                                        className={`min-h-[120px] border-r border-b border-border/20 p-3 flex flex-col gap-2 transition-colors relative group ${!isCurrentMonth ? 'bg-muted/5 opacity-30 contrast-75' : 'bg-background hover:bg-muted/5'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className={`mono text-[10px] font-bold ${isSameDay(date, new Date()) ? 'text-accent border-b-2 border-accent pb-0.5' : 'text-secondary/60'}`}>
                                                {format(date, 'd')}
                                            </span>
                                            {dayTasks.length > 0 && (
                                                <div className="w-1 h-1 bg-accent rounded-none" />
                                            )}
                                        </div>

                                        <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                                            {dayDebts.map(debt => (
                                                <div key={`debt-${debt.id}`} className="bg-red-500 text-white px-2 py-1 mono text-[8px] font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                                                    <AlertCircle size={8} />
                                                    <span className="truncate">Cycle_Trigger: {debt.title}</span>
                                                </div>
                                            ))}
                                            {dayTasks.map(task => (
                                                <div
                                                    key={task.id}
                                                    className={`px-2 py-1 mono text-[8px] border font-bold uppercase transition-all hover:scale-[1.02] cursor-default
                                                        ${task.priority === 'high' ? 'bg-primary text-white border-primary' :
                                                            task.priority === 'medium' ? 'bg-background text-primary border-primary/40' :
                                                                'bg-muted text-secondary border-border/60'}`}
                                                >
                                                    <span className="truncate">{task.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlannerBoard;
