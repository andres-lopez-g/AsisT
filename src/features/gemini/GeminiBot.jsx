import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Bot,
    Send,
    Loader2,
    TrendingUp,
    CheckCircle2,
    Sparkles,
    MessageSquare,
    AlertCircle
} from 'lucide-react';

const GeminiBot = () => {
    const { authFetch } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [botAvailable, setBotAvailable] = useState(false);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        checkBotStatus();
        loadHistory();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const checkBotStatus = async () => {
        try {
            const res = await authFetch('/api/gemini/status');
            if (res.ok) {
                const data = await res.json();
                setBotAvailable(data.available);
            }
        } catch (err) {
            console.error('Error checking bot status:', err);
        }
    };

    const loadHistory = async () => {
        try {
            const res = await authFetch('/api/gemini/history?limit=10');
            if (res.ok) {
                const data = await res.json();
                const formattedMessages = data.conversations.flatMap(conv => [
                    { type: 'user', content: conv.user_message, timestamp: conv.created_at },
                    { type: 'bot', content: conv.bot_response, timestamp: conv.created_at }
                ]);
                setMessages(formattedMessages);
            }
        } catch (err) {
            console.error('Error loading history:', err);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || loading || !botAvailable) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const res = await authFetch('/api/gemini/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage })
            });

            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, { type: 'bot', content: data.response }]);
            } else {
                const error = await res.json();
                setMessages(prev => [...prev, { 
                    type: 'bot', 
                    content: `Error: ${error.message || 'No pude procesar tu mensaje'}`,
                    isError: true
                }]);
            }
        } catch (err) {
            console.error('Error sending message:', err);
            setMessages(prev => [...prev, { 
                type: 'bot', 
                content: 'Error: No pude conectarme al servicio',
                isError: true
            }]);
        } finally {
            setLoading(false);
        }
    };

    const getFinancialRecommendations = async () => {
        setLoadingRecommendations(true);
        setMessages(prev => [...prev, { type: 'user', content: '📊 Obtener recomendaciones financieras' }]);

        try {
            const res = await authFetch('/api/gemini/recommendations/financial');
            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, { type: 'bot', content: data.recommendations }]);
            } else {
                const error = await res.json();
                setMessages(prev => [...prev, { 
                    type: 'bot', 
                    content: `Error: ${error.message || 'No pude generar recomendaciones'}`,
                    isError: true
                }]);
            }
        } catch (err) {
            console.error('Error getting recommendations:', err);
            setMessages(prev => [...prev, { 
                type: 'bot', 
                content: 'Error: No pude obtener recomendaciones',
                isError: true
            }]);
        } finally {
            setLoadingRecommendations(false);
        }
    };

    const getProductivityTips = async () => {
        setLoadingRecommendations(true);
        setMessages(prev => [...prev, { type: 'user', content: '✅ Obtener consejos de productividad' }]);

        try {
            const res = await authFetch('/api/gemini/recommendations/productivity');
            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, { type: 'bot', content: data.tips }]);
            } else {
                const error = await res.json();
                setMessages(prev => [...prev, { 
                    type: 'bot', 
                    content: `Error: ${error.message || 'No pude generar consejos'}`,
                    isError: true
                }]);
            }
        } catch (err) {
            console.error('Error getting tips:', err);
            setMessages(prev => [...prev, { 
                type: 'bot', 
                content: 'Error: No pude obtener consejos',
                isError: true
            }]);
        } finally {
            setLoadingRecommendations(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!botAvailable) {
        return (
            <div className="p-8 md:p-12 max-w-7xl mx-auto">
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                    <div className="p-6 border-2 border-amber-500/50 bg-amber-500/5">
                        <AlertCircle size={48} className="text-amber-500" />
                    </div>
                    <div className="text-center space-y-2 max-w-md">
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-primary">
                            Bot No Disponible
                        </h2>
                        <p className="text-sm text-secondary">
                            Para usar el asistente AI, configura la variable de entorno <code className="px-2 py-1 bg-muted mono text-xs">GEMINI_API_KEY</code> con tu clave de API de Google Gemini.
                        </p>
                        <p className="text-xs text-secondary/70 mt-4">
                            Obtén tu clave gratuita en: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google AI Studio</a>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b-2 border-primary/10">
                <div className="space-y-1">
                    <p className="mono text-xs font-bold text-accent uppercase tracking-[0.3em]">AI Assistant</p>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic text-primary">
                        AsisT Bot
                    </h1>
                </div>
                <div className="flex items-center gap-3 mono text-[10px] font-bold text-secondary uppercase tracking-widest bg-muted px-4 py-2 border border-border/50">
                    <Sparkles size={12} className="text-primary" />
                    <span>Powered by Gemini</span>
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={getFinancialRecommendations}
                    disabled={loadingRecommendations}
                    className="p-6 border border-border bg-background hover:bg-muted/50 transition-all duration-200 text-left group"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="p-3 border border-border bg-muted/30 group-hover:bg-primary/10 transition-colors">
                            <TrendingUp size={20} className="text-primary" />
                        </div>
                        {loadingRecommendations && (
                            <Loader2 size={16} className="text-primary animate-spin" />
                        )}
                    </div>
                    <h3 className="font-bold text-sm uppercase tracking-tight mb-1">Recomendaciones Financieras</h3>
                    <p className="text-xs text-secondary">Obtén consejos personalizados sobre tus finanzas</p>
                </button>

                <button
                    onClick={getProductivityTips}
                    disabled={loadingRecommendations}
                    className="p-6 border border-border bg-background hover:bg-muted/50 transition-all duration-200 text-left group"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="p-3 border border-border bg-muted/30 group-hover:bg-primary/10 transition-colors">
                            <CheckCircle2 size={20} className="text-primary" />
                        </div>
                        {loadingRecommendations && (
                            <Loader2 size={16} className="text-primary animate-spin" />
                        )}
                    </div>
                    <h3 className="font-bold text-sm uppercase tracking-tight mb-1">Consejos de Productividad</h3>
                    <p className="text-xs text-secondary">Mejora tu organización y gestión de tareas</p>
                </button>
            </div>

            {/* Chat Container */}
            <div className="border border-border bg-background">
                {/* Messages Area */}
                <div className="h-[500px] overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
                            <div className="p-6 border border-border bg-muted/30">
                                <Bot size={48} className="text-primary" />
                            </div>
                            <div className="space-y-2 max-w-md">
                                <h3 className="font-bold text-lg uppercase tracking-tight">¡Hola! Soy AsisT Bot</h3>
                                <p className="text-sm text-secondary">
                                    Puedo ayudarte con recomendaciones financieras, consejos de productividad, 
                                    y responder tus preguntas sobre tu información personal.
                                </p>
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.type === 'bot' && (
                                    <div className="p-2 border border-border bg-muted/30 h-fit">
                                        <Bot size={16} className="text-primary" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] p-4 ${
                                        msg.type === 'user'
                                            ? 'bg-primary text-white border border-primary'
                                            : msg.isError
                                            ? 'bg-red-500/10 border border-red-500/50 text-red-600'
                                            : 'bg-muted/50 border border-border'
                                    }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                </div>
                                {msg.type === 'user' && (
                                    <div className="p-2 border border-primary bg-primary/10 h-fit">
                                        <MessageSquare size={16} className="text-primary" />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                    {loading && (
                        <div className="flex gap-3">
                            <div className="p-2 border border-border bg-muted/30 h-fit">
                                <Bot size={16} className="text-primary" />
                            </div>
                            <div className="bg-muted/50 border border-border p-4">
                                <div className="flex items-center gap-2">
                                    <Loader2 size={16} className="text-primary animate-spin" />
                                    <span className="text-sm text-secondary">Pensando...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-border p-4">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Escribe tu mensaje..."
                            disabled={loading}
                            className="flex-1 px-4 py-3 border border-border bg-background focus:outline-none focus:border-primary transition-colors mono text-sm"
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="px-6 py-3 bg-primary text-white font-bold uppercase text-xs tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-primary"
                        >
                            {loading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Send size={16} />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeminiBot;
