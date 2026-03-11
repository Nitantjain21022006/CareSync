import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Filter,
    ShieldCheck,
    ShieldAlert,
    MoreHorizontal,
    UserCheck,
    UserX,
    Mail,
    Phone,
    Calendar,
    Settings,
    X,
    ArrowUpRight,
    UserPlus,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Ban,
    CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../config/api';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [message, setMessage] = useState({ type: '', text: '' });

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    // Provision Modal State
    const [showProvisionModal, setShowProvisionModal] = useState(false);
    const [provisionForm, setProvisionForm] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'hospital_staff',
        phone: ''
    });

    // Action Menu State
    const [activeActionMenu, setActiveActionMenu] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, [page, roleFilter, searchTerm]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users', {
                params: {
                    page,
                    limit: 8,
                    role: roleFilter,
                    searchTerm
                }
            });
            setUsers(res.data.data || []);
            setTotalPages(res.data.pagination.totalPages);
            setTotalUsers(res.data.total);
        } catch (err) {
            console.error('Error fetching users');
            setMessage({ type: 'error', text: 'Institutional data access failure.' });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyDoctor = async (userId, isVerified) => {
        try {
            await api.put(`/admin/verify/${userId}`, { isVerified });
            setMessage({ type: 'success', text: `Clinician ${isVerified ? 'authorized' : 'revoked'} successfully.` });
            fetchUsers();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Verification synchronization error.' });
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            await api.put(`/admin/users/${userId}/status`, { isActive: !currentStatus });
            setMessage({ type: 'success', text: `User status updated successfully.` });
            fetchUsers();
            setActiveActionMenu(null);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Status update failed.' });
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            setMessage({ type: 'success', text: `Identity purged from system.` });
            fetchUsers();
            setActiveActionMenu(null);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Purge operation failed.' });
        }
    };

    const handleProvision = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/users/provision', provisionForm);
            setMessage({ type: 'success', text: `New identity provisioned successfully.` });
            setShowProvisionModal(false);
            setProvisionForm({ fullName: '', email: '', password: '', role: 'hospital_staff', phone: '' });
            fetchUsers();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Provisioning failed.' });
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-[#1A202C] tracking-tighter flex items-center gap-3">
                        Population Control
                    </h1>
                    <p className="text-[#a0aec0] font-bold text-sm tracking-tight mt-1">Institutional oversight and professional credentialing.</p>
                </div>
                <button
                    onClick={() => setShowProvisionModal(true)}
                    className="flex items-center gap-3 bg-[#1A202C] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#2D3748] transition-all shadow-xl">
                    <UserPlus size={16} /> provision account
                </button>
            </div>

            <AnimatePresence>
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-6 rounded-[1.5rem] flex items-center justify-between shadow-2xl ${message.type === 'success' ? 'bg-[#2D7D6F] text-white shadow-[#2D7D6F]/20' : 'bg-red-500 text-white shadow-red-500/20'
                            }`}>
                        <div className="flex items-center gap-4">
                            {message.type === 'success' ? <UserCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
                            <span className="text-xs font-black uppercase tracking-[0.1em]">{message.text}</span>
                        </div>
                        <button onClick={() => setMessage({ type: '', text: '' })}><X size={18} /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-white border border-[#E2E8F0] rounded-[3rem] overflow-hidden shadow-sm">
                <div className="p-8 bg-[#F8FBFA]/30 border-b border-[#F1F5F9] flex flex-col md:flex-row gap-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0AEC0]" />
                        <input
                            type="text"
                            placeholder="Find identity by name or digital address..."
                            className="w-full bg-[#F8FBFA] border border-[#E2E8F0] rounded-2xl py-4 pl-12 pr-4 text-xs font-black text-[#1A202C] focus:outline-none focus:border-[#2D7D6F] transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                    <div className="flex items-center gap-4 bg-white border border-[#E2E8F0] rounded-2xl px-6 py-4 shadow-sm">
                        <Filter className="h-4 w-4 text-[#2D7D6F]" />
                        <select
                            className="bg-transparent border-none text-[#1A202C] text-[10px] font-black uppercase tracking-widest focus:ring-0 cursor-pointer appearance-none pr-8"
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="all">Unified Population</option>
                            <option value="patient">Sectors: Patient</option>
                            <option value="doctor">Sectors: Clinician</option>
                            <option value="hospital_staff">Sectors: Staff</option>
                            <option value="admin">Sectors: Executive</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F8FBFA]/50">
                                <th className="px-10 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-[#A0AEC0]">Identity Core</th>
                                <th className="px-10 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-[#A0AEC0]">Functional Role</th>
                                <th className="px-10 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-[#A0AEC0]">Verification</th>
                                <th className="px-10 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-[#A0AEC0] text-right">Operational</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F1F5F9]">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-10 py-8"><div className="h-12 w-48 bg-[#F8FBFA] rounded-xl"></div></td>
                                        <td className="px-10 py-8"><div className="h-8 w-32 bg-[#F8FBFA] rounded-xl"></div></td>
                                        <td className="px-10 py-8"><div className="h-8 w-24 bg-[#F8FBFA] rounded-xl"></div></td>
                                        <td className="px-10 py-8 text-right"><div className="h-10 w-10 bg-[#F8FBFA] rounded-xl ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : users.map((user, idx) => (
                                <motion.tr
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={user._id}
                                    className="hover:bg-[#F8FBFA] transition-all group"
                                >
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center font-black text-[#2D7D6F] shadow-sm group-hover:bg-[#1A202C] group-hover:text-white group-hover:border-[#1A202C] transition-all">
                                                {user.fullName?.[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-[#1A202C] tracking-tight">{user.fullName}</p>
                                                <p className="text-[9px] text-[#A0AEC0] font-black uppercase tracking-widest mt-1">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${user.role === 'admin' ? 'bg-[#1A202C] text-white border-[#1A202C]' :
                                            user.role === 'doctor' ? 'bg-[#E9F5F3] text-[#2D7D6F] border-[#D1E8E4]' :
                                                'bg-white text-[#A0AEC0] border-[#E2E8F0]'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        {user.role === 'doctor' && (
                                            <div className="flex items-center gap-2">
                                                {user.metadata?.isVerified ? (
                                                    <span className="flex items-center gap-2 text-[10px] text-emerald-600 font-black uppercase tracking-widest">
                                                        <ShieldCheck className="h-3.5 w-3.5" /> AUTHORIZED
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2 text-[10px] text-amber-500 font-black uppercase tracking-widest">
                                                        <ShieldAlert className="h-3.5 w-3.5" /> PENDING SYNC
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {user.role !== 'doctor' && <span className="text-[10px] text-[#A0AEC0] font-black uppercase tracking-widest">VERIFIED</span>}
                                    </td>
                                    <td className="px-10 py-8 text-right relative">
                                        <div className="flex items-center justify-end gap-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all">
                                            {user.role === 'doctor' && !user.metadata?.isVerified && (
                                                <button
                                                    onClick={() => handleVerifyDoctor(user._id, true)}
                                                    className="p-3 bg-[#E9F5F3] text-[#2D7D6F] rounded-xl hover:bg-[#2D7D6F] hover:text-white transition-all shadow-sm"
                                                    title="Authorize Clinician"
                                                >
                                                    <UserCheck size={16} />
                                                </button>
                                            )}
                                            <div className="relative">
                                                <button
                                                    onClick={() => setActiveActionMenu(activeActionMenu === user._id ? null : user._id)}
                                                    className={`p-3 rounded-xl transition-all shadow-sm ${activeActionMenu === user._id ? 'bg-[#1A202C] text-white' : 'bg-white border border-[#E2E8F0] text-[#A0AEC0] hover:bg-[#1A202C] hover:text-white'}`}>
                                                    <Settings size={16} />
                                                </button>

                                                {activeActionMenu === user._id && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl z-50 p-2 space-y-1">
                                                        <button
                                                            onClick={() => handleToggleStatus(user._id, user.isVerified)}
                                                            className="w-full flex items-center gap-3 p-3 text-[10px] font-black uppercase tracking-widest text-[#1A202C] hover:bg-[#F8FBFA] rounded-xl transition-all">
                                                            {user.isVerified ? <Ban size={14} className="text-amber-500" /> : <CheckCircle2 size={14} className="text-emerald-500" />}
                                                            {user.isVerified ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user._id)}
                                                            className="w-full flex items-center gap-3 p-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                            <Trash2 size={14} /> Purge Identity
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && users.length > 0 && (
                    <div className="px-10 py-8 border-t border-[#F1F5F9] flex items-center justify-between bg-[#F8FBFA]/20">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#A0AEC0]">
                            Showing <span className="text-[#1A202C]">{users.length}</span> of <span className="text-[#1A202C]">{totalUsers}</span> Identities
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-3 bg-white border border-[#E2E8F0] rounded-xl text-[#A0AEC0] disabled:opacity-30 hover:bg-[#1A202C] hover:text-white transition-all shadow-sm">
                                <ChevronLeft size={16} />
                            </button>
                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i + 1)}
                                        className={`h-10 w-10 rounded-xl text-[10px] font-black transition-all ${page === i + 1 ? 'bg-[#2D7D6F] text-white shadow-lg shadow-[#2D7D6F]/20' : 'bg-white border border-[#E2E8F0] text-[#A0AEC0] hover:bg-[#F8FBFA]'}`}>
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-3 bg-white border border-[#E2E8F0] rounded-xl text-[#A0AEC0] disabled:opacity-30 hover:bg-[#1A202C] hover:text-white transition-all shadow-sm">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {!loading && users.length === 0 && (
                    <div className="py-28 text-center bg-[#F8FBFA]/30">
                        <Users className="h-16 w-16 text-[#E2E8F0] mx-auto mb-6" />
                        <h4 className="text-xl font-black text-[#1A202C] tracking-tight">Population Missing</h4>
                        <p className="text-[#A0AEC0] font-bold text-sm mt-2">No identities discovered matching these parameters.</p>
                    </div>
                )}
            </div>

            {/* Provision Modal */}
            <AnimatePresence>
                {showProvisionModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#1A202C]/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl">
                            <div className="p-10 border-b border-[#F1F5F9] flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-[#1A202C] tracking-tighter">Identity Provisioning</h3>
                                    <p className="text-[#A0AEC0] text-xs font-bold font-sans">Initialize new institutional credentials.</p>
                                </div>
                                <button onClick={() => setShowProvisionModal(false)} className="p-3 bg-[#F8FBFA] rounded-2xl hover:bg-neutral-100 transition-all">
                                    <X size={20} className="text-[#1A202C]" />
                                </button>
                            </div>
                            <form onSubmit={handleProvision} className="p-10 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#A0AEC0] ml-1">Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-[#F8FBFA] border border-[#E2E8F0] rounded-2xl py-4 px-6 text-xs font-bold text-[#1A202C] focus:outline-none focus:border-[#2D7D6F] transition-all"
                                            placeholder="John Doe"
                                            value={provisionForm.fullName}
                                            onChange={e => setProvisionForm({ ...provisionForm, fullName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#A0AEC0] ml-1">Functional Role</label>
                                        <select
                                            className="w-full bg-[#F8FBFA] border border-[#E2E8F0] rounded-2xl py-4 px-6 text-xs font-bold text-[#1A202C] focus:outline-none focus:border-[#2D7D6F] transition-all appearance-none"
                                            value={provisionForm.role}
                                            onChange={e => setProvisionForm({ ...provisionForm, role: e.target.value })}
                                        >
                                            <option value="hospital_staff">Hospital Staff</option>
                                            <option value="doctor">Clinician (Doctor)</option>
                                            <option value="admin">Executive (Admin)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#A0AEC0] ml-1">Digital Address (Email)</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full bg-[#F8FBFA] border border-[#E2E8F0] rounded-2xl py-4 px-6 text-xs font-bold text-[#1A202C] focus:outline-none focus:border-[#2D7D6F] transition-all"
                                        placeholder="user@caresync.com"
                                        value={provisionForm.email}
                                        onChange={e => setProvisionForm({ ...provisionForm, email: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#A0AEC0] ml-1">Access Credentials</label>
                                        <input
                                            required
                                            type="password"
                                            className="w-full bg-[#F8FBFA] border border-[#E2E8F0] rounded-2xl py-4 px-6 text-xs font-bold text-[#1A202C] focus:outline-none focus:border-[#2D7D6F] transition-all"
                                            placeholder="••••••••"
                                            value={provisionForm.password}
                                            onChange={e => setProvisionForm({ ...provisionForm, password: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#A0AEC0] ml-1">Mobile Contact</label>
                                        <input
                                            type="text"
                                            className="w-full bg-[#F8FBFA] border border-[#E2E8F0] rounded-2xl py-4 px-6 text-xs font-bold text-[#1A202C] focus:outline-none focus:border-[#2D7D6F] transition-all"
                                            placeholder="+91 00000 00000"
                                            value={provisionForm.phone}
                                            onChange={e => setProvisionForm({ ...provisionForm, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-[#1A202C] text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#2D3748] transition-all shadow-xl shadow-[#1A202C]/10">
                                    Confirm Provisioning
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserManagement;
