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
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#1A202C] rounded-2xl shadow-xl shadow-black/10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#2D7D6F] to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                        <Bot className="h-6 w-6 text-white relative z-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-[#1A202C] tracking-tighter">CareAI Assistant</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10B981]"></span>
                            <span className="text-[10px] text-[#A0AEC0] font-black uppercase tracking-widest">Neural Link Active • Secure Encrypted</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-4 py-2 bg-[#F8FBFA] border border-[#E2E8F0] rounded-xl flex items-center gap-2">
                        <Activity size={14} className="text-[#2D7D6F]" />
                        <span className="text-[10px] font-black text-[#2D7D6F] uppercase tracking-widest">System Load: Nominal</span>
                    </div>
                </div>
            </div>

            {/* Chat Container */}
            <div className="flex-1 bg-white border border-[#E2E8F0] rounded-[3rem] overflow-hidden flex flex-col relative shadow-2xl shadow-[#2D7D6F]/5">
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#F8FBFA] to-transparent pointer-events-none z-10"></div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar relative z-0">
                    <AnimatePresence>
                        {messages.map((msg, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex gap-5 max-w-[75%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`h-10 w-10 rounded-2xl shrink-0 flex items-center justify-center font-black text-[10px] tracking-tighter shadow-sm ${msg.sender === 'user' ? 'bg-[#1A202C] text-white' : 'bg-white border border-[#E2E8F0] text-[#2D7D6F]'
                                        }`}>
                                        {msg.sender === 'user' ? 'USER' : 'AI'}
                                    </div>
                                    <div className={`p-6 rounded-[2rem] text-sm font-bold leading-relaxed relative ${msg.sender === 'user'
                                        ? 'bg-[#1A202C] text-white rounded-tr-none'
                                        : 'bg-[#F8FBFA] text-[#1A202C] border border-[#E1E8E6] rounded-tl-none'
                                        }`}>
                                        {msg.text}
                                        <div className={`text-[9px] mt-3 font-black uppercase tracking-widest opacity-40 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • SYNCED
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {loading && (
                        <div className="flex justify-start">
                            <div className="flex gap-5 max-w-[75%] items-center">
                                <div className="h-10 w-10 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center">
                                    <Loader2 className="h-5 w-5 text-[#2D7D6F] animate-spin" />
                                </div>
                                <div className="p-6 bg-[#F8FBFA] rounded-[2rem] rounded-tl-none border border-[#E1E8E6] flex space-x-2">
                                    <div className="h-1.5 w-1.5 bg-[#2D7D6F] rounded-full animate-bounce"></div>
                                    <div className="h-1.5 w-1.5 bg-[#2D7D6F] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="h-1.5 w-1.5 bg-[#2D7D6F] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-10 bg-white border-t border-[#F1F5F9] relative z-20">
                    <form onSubmit={handleSendMessage} className="relative group">
                        <input
                            type="text"
                            className="w-full bg-[#F8FBFA] border border-[#E2E8F0] rounded-[2rem] py-6 pl-8 pr-20 text-sm font-bold text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#2D7D6F] transition-all shadow-inner"
                            placeholder="Inquire about clinical data, biometric trends, or system navigation..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-[#1A202C] text-white rounded-full hover:bg-[#2D3748] transition-all disabled:opacity-20 shadow-xl active:scale-95"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                    <div className="mt-6 flex items-center justify-between px-4">
                        <div className="flex items-center gap-6 text-[9px] text-[#A0AEC0] font-black uppercase tracking-[0.2em]">
                            <span className="flex items-center gap-2"><Sparkles className="h-3 w-3 text-[#2D7D6F]" /> CareAI Neural Core</span>
                            <span className="flex items-center gap-2"><Shield className="h-3 w-3 text-emerald-500" /> End-to-End Encryption</span>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-black text-[#2D7D6F] uppercase tracking-widest cursor-pointer hover:underline">
                            <Zap size={12} /> Clear Session Archives
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIHealthAssistant;
