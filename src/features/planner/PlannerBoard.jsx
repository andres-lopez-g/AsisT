import React, { useState, useEffect } from 'react';
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
    Loader2
} from 'lucide-react';

const TaskCard = ({ task, onDelete, onStatusChange }) => (
    <div className="minimal-card p-3 mb-2 hover:shadow-md transition-all group border-l-4 border-l-transparent hover:border-l-primary/50 relative">
        <div className="flex justify-between items-start mb-2">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide
        ${task.priority === 'high' ? 'bg-red-50 text-red-600' :
                    task.priority === 'medium' ? 'bg-orange-50 text-orange-600' :
                        'bg-blue-50 text-blue-600'}`}>
                {task.priority}
            </span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onDelete(task.id)}
                    className="text-secondary hover:text-red-500 p-0.5"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
        <h4 className="font-medium text-sm text-foreground mb-2 line-clamp-2">{task.title}</h4>
        <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-secondary gap-1.5">
                <CalendarIcon size={12} />
                <span>{task.date}</span>
            </div>
            <select
                value={task.status}
                onChange={(e) => onStatusChange(task.id, e.target.value)}
                className="text-[10px] bg-muted/50 border-none rounded px-1 py-0.5 focus:ring-0 cursor-pointer"
            >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
            </select>
        </div>
    </div>
);

const Column = ({ title, tasks, icon: Icon, colorClass, onDelete, onStatusChange, onAdd }) => (
    <div className="flex-1 min-w-[280px] bg-muted/30 rounded-lg p-3 h-full overflow-hidden flex flex-col border border-border/50">
        <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
                <Icon size={16} className={colorClass} />
                <h3 className="font-semibold text-sm text-foreground">{title}</h3>
                <span className="text-xs text-secondary font-mono">({tasks.length})</span>
            </div>
            <button
                onClick={onAdd}
                className="text-secondary hover:text-foreground hover:bg-black/5 rounded p-0.5"
            >
                <Plus size={16} />
            </button>
        </div>
        <div className="space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar">
            {tasks.map(task => (
                <TaskCard
                    key={task.id}
                    task={task}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                />
            ))}
            {tasks.length === 0 && (
                <div className="py-8 text-center text-secondary text-xs border border-dashed border-border rounded-lg">
                    Empty
                </div>
            )}
        </div>
    </div>
);

const TaskModal = ({ isOpen, onClose, onAdd }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [priority, setPriority] = useState('medium');
    const [status, setStatus] = useState('todo');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({ title, date, priority, status });
        setTitle('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-foreground">Add Task</h2>
                    <button onClick={onClose} className="text-secondary hover:text-foreground">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-secondary uppercase mb-1">Title</label>
                        <input
                            required
                            className="w-full bg-muted/30 border border-border rounded p-2 text-sm focus:ring-1 focus:ring-primary outline-none text-foreground"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Finish report"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-secondary uppercase mb-1">Date</label>
                            <input
                                type="date"
                                className="w-full bg-muted/30 border border-border rounded p-2 text-sm focus:ring-1 focus:ring-primary outline-none text-foreground"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-secondary uppercase mb-1">Priority</label>
                            <select
                                className="w-full bg-muted/30 border border-border rounded p-2 text-sm focus:ring-1 focus:ring-primary outline-none text-foreground"
                                value={priority}
                                onChange={e => setPriority(e.target.value)}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-secondary uppercase mb-1">Initial Status</label>
                        <select
                            className="w-full bg-muted/30 border border-border rounded p-2 text-sm focus:ring-1 focus:ring-primary outline-none text-foreground"
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                        >
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Done</option>
                        </select>
                    </div>

                    <button type="submit" className="w-full bg-primary text-white py-2 rounded-md font-medium text-sm mt-4 hover:opacity-90 transition-opacity">
                        Create Task
                    </button>
                </form>
            </div>
        </div>
    );
};

const PlannerBoard = () => {
    const [tasks, setTasks] = useState([]);
    const [view, setView] = useState('kanban');
    const [loading, setLoading] = useState(true);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [defaultStatus, setDefaultStatus] = useState('todo');

    const token = localStorage.getItem('token');

    const fetchTasks = async () => {
        try {
            const res = await fetch('/api/planner', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTasks(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchTasks();
    }, [token]);

    const addTask = async (taskData) => {
        try {
            const res = await fetch('/api/planner', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(taskData)
            });
            if (res.ok) {
                const newTask = await res.json();
                setTasks([...tasks, newTask]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const updateTaskStatus = async (taskId, newStatus) => {
        try {
            const res = await fetch(`/api/planner/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const deleteTask = async (taskId) => {
        try {
            const res = await fetch(`/api/planner/${taskId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setTasks(tasks.filter(t => t.id !== taskId));
            }
        } catch (err) {
            console.error(err);
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
        <div className="p-6 md:p-10 space-y-6 max-w-7xl mx-auto h-full flex flex-col">
            <TaskModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={addTask}
            />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Planner</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => openAddModal()}
                        className="bg-primary text-white p-2 rounded-full hover:opacity-90 transition-opacity md:hidden"
                    >
                        <Plus size={20} />
                    </button>
                    <div className="flex bg-muted/50 p-1 rounded-md">
                        <button
                            onClick={() => setView('kanban')}
                            className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-2 ${view === 'kanban' ? 'bg-white text-primary shadow-sm' : 'text-secondary hover:text-foreground'}`}
                        >
                            <Layout size={14} />
                            <span className="hidden sm:inline">Board</span>
                        </button>
                        <button
                            onClick={() => setView('calendar')}
                            className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-2 ${view === 'calendar' ? 'bg-white text-primary shadow-sm' : 'text-secondary hover:text-foreground'}`}
                        >
                            <CalendarIcon size={14} />
                            <span className="hidden sm:inline">Calendar</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Kanban Board */}
            {view === 'kanban' && (
                <div className="flex gap-4 overflow-x-auto pb-4 h-full items-start">
                    <Column
                        title="To Do"
                        tasks={todoTasks}
                        icon={Circle}
                        colorClass="text-secondary"
                        onDelete={deleteTask}
                        onStatusChange={updateTaskStatus}
                        onAdd={() => openAddModal('todo')}
                    />
                    <Column
                        title="In Progress"
                        tasks={inProgressTasks}
                        icon={Clock}
                        colorClass="text-blue-600"
                        onDelete={deleteTask}
                        onStatusChange={updateTaskStatus}
                        onAdd={() => openAddModal('in-progress')}
                    />
                    <Column
                        title="Done"
                        tasks={doneTasks}
                        icon={CheckCircle2}
                        colorClass="text-green-600"
                        onDelete={deleteTask}
                        onStatusChange={updateTaskStatus}
                        onAdd={() => openAddModal('done')}
                    />
                </div>
            )}

            {/* Calendar Placeholder */}
            {view === 'calendar' && (
                <div className="minimal-card p-12 flex items-center justify-center flex-1 bg-muted/10 border-dashed">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <CalendarIcon size={32} className="text-secondary" />
                        </div>
                        <h3 className="text-lg font-bold mb-1">Calendar View</h3>
                        <p className="text-secondary text-sm">Feature coming in next update.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlannerBoard;
