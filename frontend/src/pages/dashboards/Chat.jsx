import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getSocket } from '../../utils/socketClient';
import {
    Send,
    Search,
    MessageSquare,
    Circle,
    ChevronLeft,
    Loader2,
    CheckCheck,
    Check,
} from 'lucide-react';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';

/* ─── Helpers ─────────────────────────────────────────── */
const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (iso) => {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const groupMessagesByDate = (msgs) => {
    const groups = [];
    let currentDate = null;
    msgs.forEach((msg) => {
        const msgDate = new Date(msg.createdAt).toDateString();
        if (msgDate !== currentDate) {
            currentDate = msgDate;
            groups.push({ type: 'date', label: formatDate(msg.createdAt), key: msg.createdAt + '_date' });
        }
        groups.push({ type: 'message', data: msg, key: msg._id });
    });
    return groups;
};

import { getSocket } from '../../utils/socketClient';

/* ─── Component ───────────────────────────────────────── */
const Chat = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState({ contacts: true, messages: false });
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState({});
    const [socket, setSocket] = useState(null);

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const selectedContactRef = useRef(null);

    // Keep ref in sync for socket callbacks
    useEffect(() => {
        selectedContactRef.current = selectedContact;
    }, [selectedContact]);

    /* ── Socket Setup ── */
    useEffect(() => {
        const s = getSocket();
        setSocket(s);

        s.on('connect', () => console.log('Socket connected:', s.id));
        s.on('connect_error', (err) => console.error('Socket error:', err.message));

        s.on('onlineUsers', (users) => setOnlineUsers(users));

        s.on('newMessage', (msg) => {
            const contact = selectedContactRef.current;
            const senderId = msg.sender?._id || msg.sender;
            const myId = user?._id;

            if (contact && (senderId === contact._id || senderId === myId)) {
                setMessages((prev) => {
                    // Avoid duplicates
                    if (prev.find((m) => m._id === msg._id)) return prev;
                    return [...prev, msg];
                });
            }
        });

        s.on('messageSent', (msg) => {
            setMessages((prev) => {
                if (prev.find((m) => m._id === msg._id)) return prev;
                return [...prev, msg];
            });
        });

        s.on('userTyping', ({ senderId }) => {
            setTypingUsers((prev) => ({ ...prev, [senderId]: true }));
        });

        s.on('userStopTyping', ({ senderId }) => {
            setTypingUsers((prev) => {
                const next = { ...prev };
                delete next[senderId];
                return next;
            });
        });

        return () => {
            s.off('newMessage');
            s.off('messageSent');
            s.off('onlineUsers');
            s.off('userTyping');
            s.off('userStopTyping');
        };
    }, [user]);

    /* ── Fetch Contacts ── */
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const res = await api.get('/chat/contacts');
                const fetchedContacts = res.data.data || [];
                setContacts(fetchedContacts);

                // Auto-select from URL query param
                const queryId = searchParams.get('doctorId') || searchParams.get('patientId');
                if (queryId) {
                    const contact = fetchedContacts.find((c) => c._id === queryId);
                    if (contact) handleSelectContact(contact, fetchedContacts);
                }
            } catch (err) {
                console.error('fetchContacts error:', err);
            } finally {
                setLoading((prev) => ({ ...prev, contacts: false }));
            }
        };
        fetchContacts();
    }, []);

    /* ── Scroll to bottom ── */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    /* ── Select Contact ── */
    const handleSelectContact = useCallback(async (contact, contactList) => {
        setSelectedContact(contact);
        setMessages([]);
        setLoading((prev) => ({ ...prev, messages: true }));

        try {
            const res = await api.get(`/chat/messages/${contact._id}`);
            setMessages(res.data.data || []);
        } catch (err) {
            console.error('fetchMessages error:', err);
        } finally {
            setLoading((prev) => ({ ...prev, messages: false }));
        }
    }, []);

    /* ── Send Message ── */
    const handleSend = () => {
        if (!input.trim() || !selectedContact || !socket) return;
        socket.emit('sendMessage', { receiverId: selectedContact._id, content: input.trim() });
        setInput('');
        socket.emit('stopTyping', { receiverId: selectedContact._id });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    /* ── Typing ── */
    const handleInputChange = (e) => {
        setInput(e.target.value);
        if (!socket || !selectedContact) return;
        socket.emit('typing', { receiverId: selectedContact._id });
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stopTyping', { receiverId: selectedContact._id });
        }, 1500);
    };

    const isOnline = (contactId) => onlineUsers.includes(contactId);

    const filteredContacts = contacts.filter((c) =>
        c.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const grouped = groupMessagesByDate(messages);

    return (
        <div className="flex h-[calc(100vh-120px)] bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            {/* ── Contacts Sidebar ── */}
            <div className={`w-full md:w-80 flex-shrink-0 border-r border-slate-100 flex flex-col ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
                {/* Header */}
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all"
                        />
                    </div>
                </div>

                {/* Contact List */}
                <div className="flex-1 overflow-y-auto">
                    {loading.contacts ? (
                        <div className="flex items-center justify-center h-32">
                            <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
                        </div>
                    ) : filteredContacts.length === 0 ? (
                        <div className="py-16 text-center px-6">
                            <MessageSquare className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                            <p className="text-sm font-bold text-slate-400">No contacts yet</p>
                            <p className="text-xs text-slate-300 mt-1 font-medium">
                                Only authorized doctor–patient pairs can chat.
                            </p>
                        </div>
                    ) : (
                        filteredContacts.map((contact) => {
                            const online = isOnline(contact._id);
                            const isTyping = typingUsers[contact._id];
                            const isSelected = selectedContact?._id === contact._id;

                            return (
                                <motion.button
                                    key={contact._id}
                                    whileHover={{ backgroundColor: '#f8fafc' }}
                                    onClick={() => handleSelectContact(contact)}
                                    className={`w-full flex items-center gap-4 px-5 py-4 border-b border-slate-50 transition-all text-left ${isSelected ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : ''}`}
                                >
                                    {/* Avatar */}
                                    <div className="relative flex-shrink-0">
                                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                                            {contact.fullName?.[0]?.toUpperCase()}
                                        </div>
                                        {online && (
                                            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                                        )}
                                    </div>
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-900 text-sm truncate capitalize">{contact.fullName}</p>
                                        {isTyping ? (
                                            <p className="text-xs text-emerald-500 font-medium animate-pulse">typing…</p>
                                        ) : (
                                            <p className="text-[11px] text-slate-400 font-medium">
                                                {online ? 'Online' : 'Offline'}
                                            </p>
                                        )}
                                    </div>
                                </motion.button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* ── Chat Window ── */}
            <div className={`flex-1 flex flex-col ${selectedContact ? 'flex' : 'hidden md:flex'}`}>
                {!selectedContact ? (
                    /* Empty State */
                    <div className="flex-1 flex items-center justify-center flex-col gap-4">
                        <div className="h-20 w-20 rounded-3xl bg-emerald-50 flex items-center justify-center">
                            <MessageSquare className="h-10 w-10 text-emerald-400" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-900">Start a Conversation</h3>
                            <p className="text-slate-400 text-sm font-medium mt-1">Select a contact from the left to begin chatting.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4 bg-white">
                            <button
                                onClick={() => setSelectedContact(null)}
                                className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-all"
                            >
                                <ChevronLeft className="h-5 w-5 text-slate-500" />
                            </button>

                            <div className="relative flex-shrink-0">
                                <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                                    {selectedContact.fullName?.[0]?.toUpperCase()}
                                </div>
                                {isOnline(selectedContact._id) && (
                                    <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 capitalize">{selectedContact.fullName}</p>
                                <p className="text-xs font-medium text-slate-400">
                                    {typingUsers[selectedContact._id]
                                        ? 'typing…'
                                        : isOnline(selectedContact._id)
                                            ? 'Online'
                                            : 'Offline'}
                                </p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-1 bg-slate-50/40">
                            {loading.messages ? (
                                <div className="flex items-center justify-center h-32">
                                    <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
                                </div>
                            ) : grouped.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-32 gap-2">
                                    <MessageSquare className="h-8 w-8 text-slate-200" />
                                    <p className="text-xs font-bold text-slate-400">No messages yet. Say hello! 👋</p>
                                </div>
                            ) : (
                                grouped.map((item) => {
                                    if (item.type === 'date') {
                                        return (
                                            <div key={item.key} className="flex items-center gap-4 py-3">
                                                <div className="flex-1 h-px bg-slate-200" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    {item.label}
                                                </span>
                                                <div className="flex-1 h-px bg-slate-200" />
                                            </div>
                                        );
                                    }

                                    const msg = item.data;
                                    const senderId = msg.sender?._id || msg.sender;
                                    const isMine = senderId === user?._id;

                                    return (
                                        <motion.div
                                            key={item.key}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2`}
                                        >
                                            <div className={`max-w-[70%] group`}>
                                                <div
                                                    className={`px-5 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${isMine
                                                        ? 'bg-emerald-600 text-white rounded-br-md'
                                                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md'
                                                        }`}
                                                >
                                                    {msg.content}
                                                </div>
                                                <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                        {formatTime(msg.createdAt)}
                                                    </span>
                                                    {isMine && (
                                                        msg.read
                                                            ? <CheckCheck className="h-3 w-3 text-emerald-500" />
                                                            : <Check className="h-3 w-3 text-slate-400" />
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Bar */}
                        <div className="px-6 py-4 border-t border-slate-100 bg-white">
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    placeholder={`Message ${selectedContact.fullName}…`}
                                    value={input}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim()}
                                    className="h-12 w-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-700 active:scale-95 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                                >
                                    <Send className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Chat;
