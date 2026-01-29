import React, { useState, useEffect } from 'react';
import { Tag, Sparkles, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * SmartCategorySelector - Intelligent category selector with auto-suggestions
 * Learns from user choices and provides confidence-based recommendations
 */
const SmartCategorySelector = ({
    transactionTitle,
    value,
    onChange,
    categories = []
}) => {
    const { user } = useAuth();
    const [suggestion, setSuggestion] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showSuggestion, setShowSuggestion] = useState(false);

    // Get category suggestion when title changes
    useEffect(() => {
        if (!transactionTitle || transactionTitle.length < 3) {
            setSuggestion(null);
            setShowSuggestion(false);
            return;
        }

        const getSuggestion = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/smart/categorize', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ title: transactionTitle })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.category && data.confidence > 0.5) {
                        setSuggestion(data);
                        setShowSuggestion(true);
                    } else {
                        setSuggestion(null);
                        setShowSuggestion(false);
                    }
                }
            } catch (error) {
                console.error('Error getting category suggestion:', error);
            } finally {
                setLoading(false);
            }
        };

        // Debounce the API call
        const timer = setTimeout(getSuggestion, 500);
        return () => clearTimeout(timer);
    }, [transactionTitle]);

    // Accept suggestion
    const acceptSuggestion = async () => {
        if (!suggestion) return;

        onChange(suggestion.category);
        setShowSuggestion(false);

        // Learn from this choice
        try {
            await fetch('/api/smart/categorize/learn', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    title: transactionTitle,
                    category: suggestion.category
                })
            });
        } catch (error) {
            console.error('Error learning categorization:', error);
        }
    };

    // Reject suggestion
    const rejectSuggestion = () => {
        setShowSuggestion(false);
    };

    // Manual category selection
    const handleManualSelect = async (category) => {
        onChange(category);

        // Learn from manual selection too
        if (transactionTitle && transactionTitle.length >= 3) {
            try {
                await fetch('/api/smart/categorize/learn', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        title: transactionTitle,
                        category
                    })
                });
            } catch (error) {
                console.error('Error learning categorization:', error);
            }
        }
    };

    // Get confidence color
    const getConfidenceColor = (confidence) => {
        if (confidence >= 0.9) return 'text-green-400';
        if (confidence >= 0.75) return 'text-blue-400';
        return 'text-yellow-400';
    };

    return (
        <div className="space-y-2">
            {/* Smart Suggestion Banner */}
            {showSuggestion && suggestion && (
                <div className="bg-primary/10 border border-primary/30 p-3 rounded flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2">
                        <Sparkles size={16} className={`${getConfidenceColor(suggestion.confidence)} animate-pulse`} />
                        <div>
                            <p className="text-xs font-bold">
                                Smart Suggestion: <span className="text-primary">{suggestion.category}</span>
                            </p>
                            <p className="mono text-[9px] text-secondary uppercase tracking-wider">
                                {Math.round(suggestion.confidence * 100)}% confident • {suggestion.source === 'learned' ? 'Learned from you' : 'Default pattern'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={acceptSuggestion}
                            className="p-1.5 bg-primary/20 hover:bg-primary/30 border border-primary/50 transition-colors"
                            title="Accept suggestion"
                        >
                            <Check size={14} />
                        </button>
                        <button
                            onClick={rejectSuggestion}
                            className="p-1.5 bg-muted hover:bg-border border border-border transition-colors"
                            title="Reject suggestion"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Category Selector */}
            <div className="relative">
                <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                <select
                    value={value || ''}
                    onChange={(e) => handleManualSelect(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium text-sm"
                    required
                >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                        <option key={cat.id || cat.name} value={cat.name}>
                            {cat.name}
                        </option>
                    ))}
                </select>

                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {/* Learning Indicator */}
            {suggestion && suggestion.source === 'learned' && !showSuggestion && (
                <p className="text-[10px] text-secondary/60 flex items-center gap-1 mono">
                    <Sparkles size={10} />
                    This pattern was learned from your previous choices
                </p>
            )}
        </div>
    );
};

export default SmartCategorySelector;
