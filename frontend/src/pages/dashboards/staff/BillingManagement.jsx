import React, { useState, useEffect } from 'react';
import {
    CreditCard,
    Plus,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    XCircle,
    Download,
    Eye,
    Receipt,
    Wallet,
    X,
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../config/api';

const BillingManagement = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ patientEmail: '', amount: '', description: '' });

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            const res = await api.get('/billing');
            setBills(res.data.data || []);
        } catch (err) {
            console.error('Error fetching bills');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBill = async (e) => {
        e.preventDefault();
        try {
            await api.post('/billing', {
                patient: formData.patientEmail,
                amount: parseFloat(formData.amount),
                description: formData.description
            });
            setShowModal(false);
            setFormData({ patientEmail: '', amount: '', description: '' });
            fetchBills();
        } catch (err) {
            console.error('Error creating bill');
        }
    };

    const filtered = bills.filter(bill => {
        const matchesSearch = bill.patient?.fullName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalRevenue = bills.reduce((acc, b) => b.status === 'paid' ? acc + b.amount : acc, 0);
    const pendingRevenue = bills.reduce((acc, b) => b.status === 'pending' ? acc + b.amount : acc, 0);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-[#1A202C] tracking-tighter flex items-center gap-3">
                        Financial Operations
                    </h1>
                    <p className="text-[#a0aec0] font-bold text-sm tracking-tight mt-1">Manage institutional revenue and patient invoicing.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-3 bg-[#2D7D6F] hover:bg-[#246A5E] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-[#2D7D6F]/20"
                >
                    <Plus className="h-4 w-4" /> Finalize Invoice
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white border border-[#E2E8F0] p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-0"></div>
                    <p className="text-[#A0AEC0] text-[10px] font-black uppercase tracking-widest mb-2 relative z-10">Realized Revenue</p>
                    <h3 className="text-3xl font-black text-[#1A202C] tracking-tighter relative z-10">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                    <div className="mt-4 flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest bg-emerald-50 w-fit px-3 py-1 rounded-lg">
                        <ArrowUpRight size={12} /> 12.5% vs Last Month
                    </div>
                </div>
                <div className="bg-white border border-[#E2E8F0] p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-0"></div>
                    <p className="text-[#A0AEC0] text-[10px] font-black uppercase tracking-widest mb-2 relative z-10">Outstanding Balance</p>
                    <h3 className="text-3xl font-black text-amber-500 tracking-tighter relative z-10">${pendingRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                    <p className="mt-4 text-[10px] text-[#A0AEC0] font-black uppercase tracking-widest">{bills.filter(b => b.status === 'pending').length} Active Invoices</p>
                </div>
                <div className="bg-[#1A202C] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group text-white">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#2D7D6F]/20 rounded-bl-full -z-0"></div>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2 relative z-10">Projected Yield</p>
                    <h3 className="text-3xl font-black tracking-tighter relative z-10">${(totalRevenue + pendingRevenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                    <div className="mt-4 flex items-center gap-2 text-[#2D7D6F] text-[10px] font-black uppercase tracking-widest bg-white/5 w-fit px-3 py-1 rounded-lg border border-white/10">
                        <TrendingUp size={12} /> Institutional Target Meta
                    </div>
                </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-[3rem] overflow-hidden shadow-sm">
                <div className="p-8 bg-[#F8FBFA]/30 border-b border-[#F1F5F9] flex flex-col md:flex-row gap-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0AEC0]" />
                        <input
                            type="text"
                            placeholder="Find invoice by patient identity..."
                            className="w-full bg-[#F8FBFA] border border-[#E2E8F0] rounded-2xl py-4 pl-12 pr-4 text-xs font-black text-[#1A202C] focus:outline-none focus:border-[#2D7D6F] transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4 bg-white border border-[#E2E8F0] rounded-2xl px-6 py-4 shadow-sm">
                        <Filter className="h-4 w-4 text-[#2D7D6F]" />
                        <select
                            className="bg-transparent border-none text-[#1A202C] text-[10px] font-black uppercase tracking-widest focus:ring-0 cursor-pointer appearance-none pr-8"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Consolidated View</option>
                            <option value="paid">Settled</option>
                            <option value="pending">Awaiting</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F8FBFA]/50">
                                <th className="px-10 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-[#A0AEC0]">Financial Identity</th>
                                <th className="px-10 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-[#A0AEC0]">Volume</th>
                                <th className="px-10 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-[#A0AEC0]">Origin Date</th>
                                <th className="px-10 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-[#A0AEC0]">Validation</th>
                                <th className="px-10 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-[#A0AEC0] text-right">Synchronization</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F1F5F9]">
                            {loading ? (
                                [1, 2, 3, 4].map(i => <tr key={i} className="animate-pulse"><td colSpan="5" className="h-24 bg-[#F8FBFA]/30"></td></tr>)
                            ) : filtered.length > 0 ? (
                                filtered.map((bill, idx) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={bill._id}
                                        className="hover:bg-[#F8FBFA] transition-all group"
                                    >
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-white border border-[#E2E8F0] rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-[#2D7D6F] transition-all">
                                                    <Receipt className="h-6 w-6 text-[#2D7D6F] group-hover:text-white transition-all" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-[#1A202C] tracking-tight">{bill.patient?.fullName}</p>
                                                    <p className="text-[9px] text-[#A0AEC0] font-black uppercase tracking-widest mt-1">ID: #{bill._id.slice(-6).toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <p className="text-md font-black text-[#1A202C] tracking-tighter">${bill.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                        </td>
                                        <td className="px-10 py-8">
                                            <p className="text-[10px] text-[#A0AEC0] font-black uppercase tracking-widest">{new Date(bill.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            {bill.description && <p className="text-[9px] text-[#A0AEC0] mt-1 font-bold truncate max-w-[150px]" title={bill.description}>{bill.description}</p>}
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border ${bill.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}>
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all">
                                                <button className="p-3 bg-white border border-[#E2E8F0] text-[#A0AEC0] rounded-xl hover:text-[#2D7D6F] hover:border-[#2D7D6F] transition-all">
                                                    <Download size={16} />
                                                </button>
                                                <button className="p-3 bg-white border border-[#E2E8F0] text-[#A0AEC0] rounded-xl hover:text-[#1A202C] hover:border-[#1A202C] transition-all">
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-28 text-center bg-[#F8FBFA]/30">
                                        <Wallet className="h-16 w-16 text-[#E2E8F0] mx-auto mb-6" />
                                        <h4 className="text-xl font-black text-[#1A202C] tracking-tight">Ledger Nominal</h4>
                                        <p className="text-[#A0AEC0] font-bold text-sm mt-2">No active invoices discovered in this segment.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-[#1A202C]/40 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white border border-[#E2E8F0] rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-[#F1F5F9] flex items-center justify-between bg-[#F8FBFA]/50">
                                <div>
                                    <h3 className="text-2xl font-black text-[#1A202C] tracking-tight">Financial Issuance</h3>
                                    <p className="text-xs text-[#A0AEC0] font-bold">Generate a new verifiable patient invoice.</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-3 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-[#E2E8F0]">
                                    <X className="h-6 w-6 text-[#1A202C]" />
                                </button>
                            </div>
                            <form onSubmit={handleCreateBill} className="p-10 space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em] ml-2">Patient Primary Email</label>
                                    <input
                                        className="w-full bg-[#F8FBFA] border border-[#E2E8F0] rounded-2xl px-6 py-4 text-[#1A202C] font-bold focus:outline-none focus:border-[#2D7D6F] transition-all shadow-sm"
                                        type="email"
                                        required
                                        placeholder="institutional-id@medicare.com"
                                        value={formData.patientEmail}
                                        onChange={e => setFormData({ ...formData, patientEmail: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em] ml-2">Monetary Volume (USD)</label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-[#A0AEC0]">$</span>
                                        <input
                                            className="w-full bg-[#F8FBFA] border border-[#E2E8F0] rounded-2xl pl-10 pr-6 py-4 text-[#1A202C] font-black text-xl focus:outline-none focus:border-[#2D7D6F] transition-all shadow-sm"
                                            type="number"
                                            required
                                            placeholder="00.00"
                                            value={formData.amount}
                                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em] ml-2">Service Description</label>
                                    <textarea
                                        className="w-full bg-[#F8FBFA] border border-[#E2E8F0] rounded-2xl px-6 py-4 text-[#1A202C] font-bold focus:outline-none focus:border-[#2D7D6F] transition-all shadow-sm"
                                        rows="3"
                                        placeholder="Itemized clinical services provided..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    ></textarea>
                                </div>
                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-5 bg-[#F8FBFA] text-[#1A202C] border border-[#E2E8F0] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-colors"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-5 bg-[#1A202C] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#2D3748] transition-all shadow-2xl"
                                    >
                                        Finalize Issuance
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BillingManagement;
