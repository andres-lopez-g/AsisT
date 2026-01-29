import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Zap, Target, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * FocusMode - Displays top 3 priority tasks with urgency indicators
 * Uses task intelligence to calculate priority scores
 */
const FocusMode = ({ onTaskClick }) => {
    const { user } = useAuth();
    const [focusTasks, setFocusTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFocusTasks();
    }, []);

    const fetchFocusTasks = async () => {
        try {
            const response = await fetch('/api/smart/focus-tasks?limit=3', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setFocusTasks(data);
            }
        } catch (error) {
            console.error('Error fetching focus tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const getUrgencyColor = (score) => {
        if (score >= 80) return 'border-red-500/50 bg-red-500/5';
        if (score >= 60) return 'border-yellow-500/50 bg-yellow-500/5';
        return 'border-blue-500/50 bg-blue-500/5';
    };

    const getUrgencyIcon = (score) => {
        if (score >= 80) return <AlertCircle size={14} className="text-red-400" />;
        if (score >= 60) return <Zap size={14} className="text-yellow-400" />;
        return <Target size={14} className="text-blue-400" />;
    };

    const getUrgencyLabel = (score) => {
        if (score >= 80) return 'CRITICAL';
        if (score >= 60) return 'HIGH';
        return 'MODERATE';
    };

    if (loading) {
        return (
            <div className="tech-card p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Target size={16} className="text-primary" />
                    <h3 className="font-black text-sm uppercase tracking-tight">Focus Mode</h3>
                </div>
                <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-muted/30 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (focusTasks.length === 0) {
        return (
            <div className="tech-card p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Target size={16} className="text-primary" />
                    <h3 className="font-black text-sm uppercase tracking-tight">Focus Mode</h3>
                </div>
                <div className="text-center py-8">
                    <Target size={32} className="mx-auto text-secondary/30 mb-2" />
                    <p className="text-sm text-secondary">No active tasks</p>
                    <p className="mono text-[10px] text-secondary/60 mt-1">All objectives complete</p>
                </div>
            </div>
        );
    }

    return (
        <div className="tech-card p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Target size={16} className="text-primary" />
                    <h3 className="font-black text-sm uppercase tracking-tight">Focus Mode</h3>
                </div>
                <div className="mono text-[9px] text-secondary/60 uppercase tracking-wider">
                    Top {focusTasks.length} Priority
                </div>
            </div>

            {/* Focus Tasks */}
            <div className="space-y-2">
                {focusTasks.map((task, index) => (
                    <div
                        key={task.id}
                        onClick={() => onTaskClick && onTaskClick(task)}
                        className={`
              border p-3 transition-all cursor-pointer
              hover:border-primary/50 hover:bg-primary/5
              ${getUrgencyColor(task.urgencyScore)}
            `}
                    >
                        {/* Task Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="mono text-[10px] font-bold text-primary">
                                    #{index + 1}
                                </div>
                                <h4 className="font-bold text-sm truncate flex-1">
                                    {task.title}
                                </h4>
                            </div>
                            {getUrgencyIcon(task.urgencyScore)}
                        </div>

                        {/* Task Metadata */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {/* Urgency Score */}
                                <div className="flex items-center gap-1">
                                    <div className="w-12 h-1.5 bg-muted overflow-hidden">
                                        <div
                                            className={`h-full ${task.urgencyScore >= 80 ? 'bg-red-400' :
                                                    task.urgencyScore >= 60 ? 'bg-yellow-400' :
                                                        'bg-blue-400'
                                                }`}
                                            style={{ width: `${task.urgencyScore}%` }}
                                        />
                                    </div>
                                    <span className="mono text-[9px] text-secondary font-bold">
                                        {task.urgencyScore}
                                    </span>
                                </div>

                                {/* Priority Badge */}
                                <span className={`
                  mono text-[8px] px-1.5 py-0.5 uppercase tracking-wider font-bold
                  ${task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                        task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-blue-500/20 text-blue-400'}
                `}>
                                    {task.priority}
                                </span>
                            </div>

                            {/* Deadline */}
                            {task.date && (
                                <span className="mono text-[9px] text-secondary">
                                    {new Date(task.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                            )}
                        </div>

                        {/* Urgency Label */}
                        <div className="mt-2 pt-2 border-t border-border/50">
                            <span className="mono text-[8px] text-secondary/60 uppercase tracking-widest">
                                {getUrgencyLabel(task.urgencyScore)} PRIORITY
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-3 pt-3 border-t border-border">
                <p className="mono text-[9px] text-secondary/60 text-center uppercase tracking-wider">
                    Calculated by priority algorithm
                </p>
            </div>
        </div>
    );
};

export default FocusMode;
