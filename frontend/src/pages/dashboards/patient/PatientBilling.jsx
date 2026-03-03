import React, { useState, useEffect } from 'react';
import api from '../../../config/api';
import { useSearchParams } from 'react-router-dom';
import { CreditCard, Download, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const PatientBilling = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [payingId, setPayingId] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            const res = await api.get('/billing/patient');
            if (res.data.success) {
                setBills(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching bills:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePayNow = async (billId) => {
        setPayingId(billId);
        try {
            const res = await api.post(`/billing/${billId}/pay`, {});
            if (res.data.success && res.data.url) {
                window.location.href = res.data.url;
            } else {
                alert('Payment session creation failed.');
            }
        } catch (error) {
            console.error('Error initiating payment:', error);
            alert('Error initiating payment');
        } finally {
            setPayingId(null);
        }
    };

    const handleDownloadPdf = async (bill) => {
        setDownloadingId(bill._id);
        try {
            const res = await api.get(`/billing/${bill._id}/pdf`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Receipt_${bill.invoiceId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Error downloading receipt pdf');
        } finally {
            setDownloadingId(null);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading billing information...</div>;
    }

    const pendingBills = bills.filter(b => b.status === 'pending');
    const paidBills = bills.filter(b => b.status === 'paid');

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Billing & Payments</h1>
            </div>

            {searchParams.get('success') === 'true' && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-start space-x-3">
                    <CheckCircle className="text-green-500 w-5 h-5 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-medium text-green-800">Payment Successful!</h3>
                        <p className="text-sm text-green-700 mt-1">Your payment has been successfully processed. The receipt is now available for download.</p>
                    </div>
                </div>
            )}

            {searchParams.get('canceled') === 'true' && (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-md">
                    <p className="text-sm text-orange-700 font-medium">Payment was canceled. You can try again when you're ready.</p>
                </div>
            )}

            {/* Outstanding Payments Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <h2 className="text-lg font-semibold text-gray-800">Outstanding Payments</h2>
                </div>
                <div className="p-6">
                    {pendingBills.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">You have no outstanding payments.</p>
                    ) : (
                        <div className="space-y-4">
                            {pendingBills.map(bill => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={bill._id}
                                    className="flex flex-col md:flex-row items-center justify-between p-4 border border-orange-100 bg-orange-50/30 rounded-lg gap-4"
                                >
                                    <div className="flex-1 space-y-1 text-center md:text-left">
                                        <p className="text-sm text-gray-500">Invoice: <span className="font-medium text-gray-700">{bill.invoiceId}</span></p>
                                        <p className="font-semibold text-gray-800">
                                            {bill.appointment?.doctor?.fullName ? `Consultation with Dr. ${bill.appointment.doctor.fullName}` :
                                                (bill.description || 'Medical Services')}
                                        </p>
                                        <p className="text-sm text-gray-500">Date: {new Date(bill.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right">
                                        <p className="text-2xl font-bold text-gray-900">${(bill.totalAmount || 0).toFixed(2)}</p>
                                        <button
                                            onClick={() => handlePayNow(bill._id)}
                                            disabled={payingId === bill._id}
                                            className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <CreditCard className="w-4 h-4" />
                                            {payingId === bill._id ? 'Processing...' : 'Pay Now'}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Payment History Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-teal-600" />
                    <h2 className="text-lg font-semibold text-gray-800">Payment History</h2>
                </div>
                <div className="p-6">
                    {paidBills.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No payment history found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 text-sm text-gray-500">
                                        <th className="pb-3 font-medium">Date</th>
                                        <th className="pb-3 font-medium">Invoice ID</th>
                                        <th className="pb-3 font-medium">Description</th>
                                        <th className="pb-3 font-medium">Amount</th>
                                        <th className="pb-3 font-medium text-right">Receipt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paidBills.map(bill => (
                                        <tr key={bill._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 text-sm text-gray-600">{new Date(bill.paidDate || bill.updatedAt).toLocaleDateString()}</td>
                                            <td className="py-4 text-sm font-medium text-gray-800">{bill.invoiceId}</td>
                                            <td className="py-4 text-sm text-gray-600">
                                                {bill.appointment?.doctor?.fullName ? `Dr. ${bill.appointment.doctor.fullName}` : (bill.description || 'Clinical Services')}
                                            </td>
                                            <td className="py-4 text-sm font-medium text-gray-900">${(bill.totalAmount || 0).toFixed(2)}</td>
                                            <td className="py-4 text-right">
                                                <button
                                                    onClick={() => handleDownloadPdf(bill)}
                                                    disabled={downloadingId === bill._id}
                                                    className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors inline-flex items-center gap-2 group disabled:opacity-50"
                                                    title="Download Receipt PDF"
                                                >
                                                    <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                    <span className="text-sm font-bold uppercase tracking-widest">Receipt</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientBilling;
