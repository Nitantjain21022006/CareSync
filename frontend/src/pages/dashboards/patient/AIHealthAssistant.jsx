import React, { useState, useEffect, useRef } from 'react';
import {
    Send,
    Bot,
    User,
    Sparkles,
    X,
    Minimize2,
    Maximize2,
    MessageSquare,
    Loader2,
    Trash2,
    Shield,
    Activity,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../config/api';

const AIHealthAssistant = () => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Clinical greeting. I am your specialized CareAI assistant. How can I assist with your health inquiries today?", sender: 'ai', timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: input,
            sender: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const res = await api.post('/ml/chat', { message: input });
            const aiMessage = {
                id: Date.now() + 1,
                text: res.data.data.reply,
                sender: 'ai',
                timestamp: new Date(res.data.data.timestamp)
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
            const errorMessage = {
                id: Date.now() + 1,
                text: "Operational latency detected. Secure connection interrupted. Please re-initiate inquiry.",
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-14rem)] flex flex-col space-y-6 pb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-slate-900 rounded-3xl shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-emerald-500/20 group-hover:opacity-100 transition-opacity"></div>
                        <Bot className="h-8 w-8 text-white relative z-10" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">CareNexus AI</h1>
                        <div className="flex items-center gap-3 mt-1.5">
                            <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_#10B981]"></span>
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Neural Link: ACTIVE • V3.2 Secure</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3 shadow-inner">
                        <Activity size={16} className="text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Core Status: Nominal</span>
                    </div>
                </div>
            </div>

            {/* Chat Container */}
            <div className="flex-1 bg-white border border-slate-100 rounded-[50px] overflow-hidden flex flex-col relative shadow-2xl">
                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-slate-50/80 to-transparent pointer-events-none z-10"></div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar relative z-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-50/20 via-white to-white">
                    <AnimatePresence>
                        {messages.map((msg, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex gap-5 max-w-[75%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`h-12 w-12 rounded-[22px] shrink-0 flex items-center justify-center font-black text-[10px] tracking-widest shadow-xl transition-transform hover:scale-110 ${msg.sender === 'user' ? 'bg-slate-900 text-white' : 'bg-white border-2 border-slate-50 text-emerald-600'
                                        }`}>
                                        {msg.sender === 'user' ? 'USR' : 'NXS'}
                                    </div>
                                    <div className={`p-8 rounded-[35px] text-[13px] font-bold leading-relaxed relative shadow-md transition-all hover:shadow-lg ${msg.sender === 'user'
                                        ? 'bg-slate-900 text-white rounded-tr-none'
                                        : 'bg-white text-slate-900 border border-slate-100 rounded-tl-none hover:border-emerald-100 transition-colors'
                                        }`}>
                                        {msg.text}
                                        <div className={`text-[9px] mt-4 font-black uppercase tracking-[0.2em] opacity-40 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • SYNCED_VAULT
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {loading && (
                        <div className="flex justify-start">
                            <div className="flex gap-5 max-w-[75%] items-center">
                                <div className="h-12 w-12 rounded-[22px] bg-white border-2 border-slate-50 flex items-center justify-center shadow-md">
                                    <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
                                </div>
                                <div className="p-8 bg-slate-50 rounded-[35px] rounded-tl-none border border-slate-100 flex space-x-2.5">
                                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce"></div>
                                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-10 bg-white border-t border-slate-50 relative z-20">
                    <form onSubmit={handleSendMessage} className="relative group">
                        <input
                            type="text"
                            className="w-full bg-slate-50 border border-transparent rounded-[30px] py-7 pl-10 pr-24 text-sm font-black text-slate-900 placeholder-slate-300 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner uppercase tracking-wider"
                            placeholder="Inquire regarding clinical parameters..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-5 bg-slate-900 text-white rounded-[20px] hover:bg-black transition-all disabled:opacity-10 shadow-3xl active:scale-95 group-hover:rotate-2"
                        >
                            <Send size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </form>
                    <div className="mt-8 flex items-center justify-between px-6">
                        <div className="flex items-center gap-8 text-[9px] text-slate-400 font-black uppercase tracking-[0.3em]">
                            <span className="flex items-center gap-3"><Sparkles className="h-4 w-4 text-emerald-500" /> Nexus Neural v2</span>
                            <span className="flex items-center gap-3"><Shield className="h-4 w-4 text-slate-900" /> AES-256 Verified</span>
                        </div>
                        <div className="flex items-center gap-3 text-[9px] font-black text-rose-500 uppercase tracking-[0.2em] cursor-pointer hover:underline bg-rose-50 px-4 py-2 rounded-full">
                            <Zap size={14} /> Wipe Session Buffer
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIHealthAssistant;
