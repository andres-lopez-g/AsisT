import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * FinancialHealthScore - Observatory Precision Rating (0-100)
 * Displays financial health score with breakdown and improvement suggestions
 */
const FinancialHealthScore = () => {
    const { user } = useAuth();
    const [healthData, setHealthData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHealthScore();
    }, []);

    const fetchHealthScore = async () => {
        try {
            const response = await fetch('/api/smart/health-score', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setHealthData(data);
            }
        } catch (error) {
            console.error('Error fetching health score:', error);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-green-400';
        if (score >= 80) return 'text-blue-400';
        if (score >= 70) return 'text-yellow-400';
        if (score >= 60) return 'text-orange-400';
        return 'text-red-400';
    };

    const getGradeColor = (grade) => {
        if (grade === 'A') return 'bg-green-500/20 text-green-400 border-green-500/50';
        if (grade === 'B') return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
        if (grade === 'C') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
        if (grade === 'D') return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
        return 'bg-red-500/20 text-red-400 border-red-500/50';
    };

    if (loading) {
        return (
            <div className="tech-card p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Activity size={16} className="text-primary" />
                    <h3 className="font-black text-sm uppercase tracking-tight">Observatory Precision Rating</h3>
                </div>
                <div className="h-32 bg-muted/30 animate-pulse" />
            </div>
        );
    }

    if (!healthData) {
        return null;
    }

    return (
        <div className="tech-card p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Activity size={16} className="text-primary" />
                    <h3 className="font-black text-sm uppercase tracking-tight">Financial Health</h3>
                </div>
                <div className={`
          mono text-xs px-2 py-1 border font-black
          ${getGradeColor(healthData.grade)}
        `}>
                    GRADE {healthData.grade}
                </div>
            </div>

            {/* Score Display */}
            <div className="mb-6">
                <div className="flex items-end gap-2 mb-2">
                    <div className={`text-5xl font-black ${getScoreColor(healthData.score)}`}>
                        {healthData.score}
                    </div>
                    <div className="text-secondary mb-2 mono text-sm">/100</div>
                </div>
                <div className="w-full h-2 bg-muted overflow-hidden">
                    <div
                        className={`h-full transition-all duration-1000 ${healthData.score >= 90 ? 'bg-green-400' :
                                healthData.score >= 80 ? 'bg-blue-400' :
                                    healthData.score >= 70 ? 'bg-yellow-400' :
                                        healthData.score >= 60 ? 'bg-orange-400' :
                                            'bg-red-400'
                            }`}
                        style={{ width: `${healthData.score}%` }}
                    />
                </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-3 mb-4">
                <div className="mono text-[9px] text-secondary/60 uppercase tracking-wider mb-2">
                    Score Breakdown
                </div>

                {Object.entries(healthData.breakdown).map(([key, data]) => (
                    <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="mono text-[10px] text-secondary">
                                {data.score}/{data.max}
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-muted overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${(data.score / data.max) * 100}%` }}
                            />
                        </div>
                        <div className="mono text-[9px] text-secondary/60">
                            {key === 'savingsRate' && `${data.value}% savings rate`}
                            {key === 'debtProgress' && `${data.value}% debt paid off`}
                            {key === 'budgetAdherence' && `${data.value}% adherence`}
                            {key === 'emergencyFund' && `${data.value} months covered`}
                        </div>
                    </div>
                ))}
            </div>

            {/* Suggestions */}
            {healthData.suggestions && healthData.suggestions.length > 0 && (
                <div className="border-t border-border pt-4">
                    <div className="mono text-[9px] text-secondary/60 uppercase tracking-wider mb-2">
                        Improvement Suggestions
                    </div>
                    <div className="space-y-2">
                        {healthData.suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                className={`
                  p-2 border-l-2 bg-muted/30
                  ${suggestion.priority === 'high' ? 'border-red-400' : 'border-yellow-400'}
                `}
                            >
                                <div className="flex items-start gap-2">
                                    <AlertCircle size={12} className={`
                    mt-0.5 flex-shrink-0
                    ${suggestion.priority === 'high' ? 'text-red-400' : 'text-yellow-400'}
                  `} />
                                    <div>
                                        <div className="text-[10px] font-bold mb-0.5">
                                            {suggestion.category}
                                        </div>
                                        <div className="text-[10px] text-secondary/80">
                                            {suggestion.message}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-border">
                <p className="mono text-[9px] text-secondary/60 text-center uppercase tracking-wider">
                    Updated in real-time
                </p>
            </div>
        </div>
    );
};

export default FinancialHealthScore;
