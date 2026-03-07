import React, { useState, useEffect, useRef } from 'react';
import {
    Send,
    Bot,
    Sparkles,
    Shield,
    Heart,
    CalendarDays,
    FileText,
    CreditCard,
    ChevronRight,
    RotateCcw,
    User2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../config/api';

const SUGGESTED_PROMPTS = [
    { icon: CalendarDays, label: 'My upcoming appointments', color: 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100' },
    { icon: FileText, label: 'How to view my medical records', color: 'bg-violet-50 text-violet-600 border-violet-100 hover:bg-violet-100' },
    { icon: CreditCard, label: 'How do I pay a bill?', color: 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100' },
    { icon: Heart, label: 'How do I join a video call?', color: 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100' },
];

const TypingDots = () => (
    <div className="flex items-center gap-1.5 px-1 py-1">
        {[0, 1, 2].map(i => (
            <motion.span
                key={i}
                className="h-2 w-2 rounded-full bg-emerald-400 block"
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15, ease: 'easeInOut' }}
            />
        ))}
    </div>
);

const MessageBubble = ({ msg }) => {
    const isUser = msg.sender === 'user';
    return (
        <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className={`flex items-end gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
        >
            {/* Avatar */}
            <div className={`shrink-0 h-9 w-9 rounded-2xl flex items-center justify-center shadow-md
                ${isUser
                    ? 'bg-gradient-to-br from-slate-700 to-slate-900 text-white'
                    : 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white'
                }`}>
                {isUser
                    ? <User2 size={16} />
                    : <Bot size={16} />
                }
            </div>

            {/* Bubble */}
            <div className={`max-w-[72%] group`}>
                <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${isUser
                        ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-br-sm'
                        : 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm hover:border-emerald-100 transition-colors'
                    }`}
                >
                    {msg.text}
                </div>
                <p className={`text-[10px] text-slate-400 mt-1.5 font-medium px-1
                    ${isUser ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </motion.div>
    );
};

const AIHealthAssistant = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "👋 Hi there! I'm CareNexus AI, your personal CareSync assistant. I can help you navigate your appointments, records, billing, and more.\n\nFeel free to ask me anything about the platform!",
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        if (messages.length <= 1 && !loading) {
            // On initial load / after clearing, show the welcome message from the top
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = 0;
            }
        } else {
            // During active conversation, keep latest message in view
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, loading]);

    const sendMessage = async (text) => {
        const trimmed = text.trim();
        if (!trimmed || loading) return;

        setShowSuggestions(false);
        const userMessage = { id: Date.now(), text: trimmed, sender: 'user', timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const res = await api.post('/ml/chat', { message: trimmed });
            const aiMessage = {
                id: Date.now() + 1,
                text: res.data.data.reply,
                sender: 'ai',
                timestamp: new Date(res.data.data.timestamp || Date.now())
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "I'm having a little trouble connecting right now. Please try again in a moment.",
                sender: 'ai',
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage(input);
    };

    const handleClear = () => {
        setMessages([{
            id: Date.now(),
            text: "👋 Hi there! I'm CareNexus AI, your personal CareSync assistant. I can help you navigate your appointments, records, billing, and more.\n\nFeel free to ask me anything about the platform!",
            sender: 'ai',
            timestamp: new Date()
        }]);
        setShowSuggestions(true);
        // Reset scroll to top so the welcome message is fully visible
        setTimeout(() => {
            if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
        }, 50);
        inputRef.current?.focus();
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    return (
        <div className="h-[calc(100vh-12rem)] flex flex-col gap-0 max-w-4xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between px-2 pb-5">
                <div className="flex items-center gap-4">
                    {/* AI icon with animated ring */}
                    <div className="relative h-14 w-14">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 opacity-20 animate-pulse" />
                        <div className="h-full w-full rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                            <Bot className="h-7 w-7 text-white" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">CareNexus AI</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10B981]" />
                            <span className="text-xs text-slate-500 font-medium">Online • Ready to help</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
                        <Shield size={12} className="text-emerald-600" />
                        <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">Secure</span>
                    </div>
                    <button
                        onClick={handleClear}
                        title="Clear conversation"
                        className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all"
                    >
                        <RotateCcw size={15} />
                    </button>
                </div>
            </div>

            {/* Chat window */}
            <div className="flex-1 bg-white border border-slate-100 rounded-3xl flex flex-col overflow-hidden shadow-xl shadow-slate-100/80 relative">

                {/* Subtle background decoration */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-50 rounded-full blur-[80px] opacity-60 pointer-events-none -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-teal-50 rounded-full blur-[60px] opacity-50 pointer-events-none -ml-16 -mb-16" />

                {/* Messages */}
                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 pt-6 pb-4 space-y-5 relative z-10 scroll-smooth"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>

                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <MessageBubble key={msg.id} msg={msg} />
                        ))}
                    </AnimatePresence>

                    {/* Typing indicator */}
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-end gap-3"
                        >
                            <div className="h-9 w-9 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
                                <Bot size={16} className="text-white" />
                            </div>
                            <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                                <TypingDots />
                            </div>
                        </motion.div>
                    )}

                    {/* Suggested prompts */}
                    <AnimatePresence>
                        {showSuggestions && messages.length <= 1 && !loading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col gap-3 pt-2"
                            >
                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest pl-12">
                                    Suggested questions
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-12">
                                    {SUGGESTED_PROMPTS.map(({ icon: Icon, label, color }) => (
                                        <button
                                            key={label}
                                            onClick={() => sendMessage(label)}
                                            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-sm font-medium text-left transition-all group ${color}`}
                                        >
                                            <Icon size={15} className="shrink-0 opacity-80" />
                                            <span className="flex-1">{label}</span>
                                            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div ref={messagesEndRef} />
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent mx-6" />

                {/* Input area */}
                <div className="px-5 py-4 relative z-10 bg-white/80 backdrop-blur-sm rounded-b-3xl">
                    <form onSubmit={handleSubmit} className="flex items-end gap-3">
                        <div className="flex-1 relative">
                            <textarea
                                ref={inputRef}
                                rows={1}
                                value={input}
                                onChange={e => {
                                    setInput(e.target.value);
                                    // Auto-grow textarea
                                    e.target.style.height = 'auto';
                                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                                }}
                                onKeyDown={handleKey}
                                disabled={loading}
                                placeholder="Ask me anything about CareSync..."
                                className="w-full resize-none bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 pr-12 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-300 focus:bg-white transition-all leading-relaxed disabled:opacity-60"
                                style={{ minHeight: '50px', maxHeight: '120px', overflowY: 'auto' }}
                            />
                        </div>

                        {/* Send button */}
                        <motion.button
                            type="submit"
                            disabled={loading || !input.trim()}
                            whileTap={{ scale: 0.92 }}
                            whileHover={{ scale: 1.05 }}
                            className="h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                        >
                            <Send size={17} className="translate-x-0.5 -translate-y-0.5" />
                        </motion.button>
                    </form>

                    {/* Footer hint */}
                    <div className="flex items-center justify-between mt-2.5 px-1">
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                            <span className="flex items-center gap-1">
                                <Sparkles size={10} className="text-emerald-500" />
                                Powered by CareNexus AI
                            </span>
                            <span className="flex items-center gap-1">
                                <Shield size={10} className="text-slate-400" />
                                Your data is private &amp; secure
                            </span>
                        </div>
                        <span className="text-[10px] text-slate-300 font-medium">
                            Press Enter to send
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIHealthAssistant;
