import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Info, AlertTriangle, X, Video, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const initialNotifications = [
    {
        id: 1,
        title: 'Meeting Created',
        message: 'A new consultation meeting has been scheduled with Dr. Sarah Smith.',
        time: 'Just now',
        type: 'info',
        icon: Video,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50'
    },
    {
        id: 2,
        title: 'New Message',
        message: 'You have a new message regarding your recent lab results.',
        time: '45 mins ago',
        type: 'message',
        icon: MessageSquare,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50'
    },
    {
        id: 3,
        title: 'Appointment Confirmed',
        message: 'Your appointment for tomorrow at 10:00 AM has been confirmed.',
        time: '2 hours ago',
        type: 'success',
        icon: Check,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50'
    },
    {
        id: 4,
        title: 'Prescription Ready',
        message: 'Your prescription for Amoxicillin is ready for pickup.',
        time: '1 day ago',
        type: 'warning',
        icon: AlertTriangle,
        color: 'text-amber-600',
        bg: 'bg-amber-50'
    }
];

const NotificationDropdown = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState(initialNotifications);

    const dismissNotification = (e, id) => {
        e.stopPropagation(); // Prevent dropdown from closing if clicking inside
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const markAllRead = () => {
        setNotifications([]);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop for closing on click outside */}
                    <div
                        className="fixed inset-0 z-30"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-40 overflow-hidden font-sans"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                    >
                        <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-900">Notifications</h3>
                                {notifications.length > 0 && (
                                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                        {notifications.length} New
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length > 0 ? (
                                <div className="divide-y divide-slate-50">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group relative"
                                        >
                                            <div className="flex gap-3">
                                                <div className={`w-10 h-10 rounded-xl ${notification.bg} flex items-center justify-center shrink-0`}>
                                                    <notification.icon size={18} className={notification.color} />
                                                </div>
                                                <div className="flex-1 min-w-0 pr-6">
                                                    <p className="text-sm font-bold text-slate-900 mb-0.5">{notification.title}</p>
                                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{notification.message}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium mt-2">{notification.time}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => dismissNotification(e, notification.id)}
                                                className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Mark as read"
                                            >
                                                <Check size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Bell size={20} className="text-slate-400" />
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium">No new notifications</p>
                                </div>
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <div className="p-3 border-t border-slate-50 bg-slate-50/50 text-center">
                                <button
                                    onClick={markAllRead}
                                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                                >
                                    Mark all as read
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationDropdown;
