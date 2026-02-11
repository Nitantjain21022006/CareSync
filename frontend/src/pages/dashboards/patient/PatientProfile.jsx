import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../config/api';
import {
    Edit2,
    Upload,
    User,
    Settings,
    Clipboard,
    Activity,
    Droplets,
    Calendar as CalendarIcon,
    ChevronRight,
    ChevronLeft,
    Plus,
    Phone,
    MapPin,
    AlertCircle,
    X,
    Clock,
    FileText,
    Save,
    LifeBuoy,
    Pizza,
    Zap,
    Briefcase,
    Heart,
    Trash2,
    ArrowUpRight
} from 'lucide-react';

const PatientProfile = () => {
    const { user, setUser } = useAuth();
    const [isGlobalEdit, setIsGlobalEdit] = useState(false);
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [recentRecords, setRecentRecords] = useState([]);

    const [patientData, setPatientData] = useState({
        profile: {
            name: "",
            age: "",
            gender: "",
            phone: "",
            email: "",
            address: "",
            emergencyContact: "",
            occupation: "",
            profilePic: null,
            insuranceID: "",
            bloodGroup: ""
        },
        medical: {
            medication: "",
            bp: "",
            allergies: "",
            height: "",
            weight: "",
            chronicConditions: "",
            pastSurgeries: "",
            familyHistory: "",
            lifestyle: {
                smoking: "",
                alcohol: "",
                diet: "",
                sleep: ""
            },
            immunization: "",
            symptoms: "",
            preferredPharmacy: ""
        }
    });

    useEffect(() => {
        fetchProfile();
        fetchAuthorizedDocs();
        fetchAppointments();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await api.get('/auth/me');
            const userData = res.data.data;
            if (userData) {
                setPatientDataFromUser(userData);
            }
            // Fetch recent records
            const recordsRes = await api.get('/records/patient/me');
            if (recordsRes.data.success) {
                setRecentRecords(recordsRes.data.data.slice(0, 3));
            }
        } catch (err) {
            console.error('Error fetching profile/records');
        } finally {
            setLoading(false);
        }
    };

    const setPatientDataFromUser = (userData) => {
        setPatientData({
            profile: {
                name: userData.fullName || "",
                age: userData.metadata?.age || "",
                gender: userData.metadata?.gender || "",
                phone: userData.phone || "",
                email: userData.email || "",
                address: userData.metadata?.address || "",
                emergencyContact: userData.metadata?.emergencyContact || "",
                occupation: userData.metadata?.occupation || "",
                profilePic: userData.profilePhoto || null,
                insuranceID: userData.metadata?.insuranceID || "",
                bloodGroup: userData.metadata?.bloodGroup || ""
            },
            medical: {
                medication: userData.metadata?.medication || "",
                bp: userData.metadata?.bp || "",
                allergies: userData.metadata?.allergies || "",
                height: userData.metadata?.height || "",
                weight: userData.metadata?.weight || "",
                chronicConditions: userData.metadata?.chronicConditions || "",
                pastSurgeries: userData.metadata?.pastSurgeries || "",
                familyHistory: userData.metadata?.familyHistory || "",
                lifestyle: {
                    smoking: userData.metadata?.lifestyle?.smoking || "",
                    alcohol: userData.metadata?.lifestyle?.alcohol || "",
                    diet: userData.metadata?.lifestyle?.diet || "",
                    sleep: userData.metadata?.lifestyle?.sleep || ""
                },
                immunization: userData.metadata?.immunization || "",
                symptoms: userData.metadata?.symptoms || "",
                preferredPharmacy: userData.metadata?.preferredPharmacy || ""
            }
        });
    };

    useEffect(() => {
        if (user) {
            setPatientDataFromUser(user);
        }
    }, [user]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatePayload = {
                fullName: patientData.profile.name,
                phone: patientData.profile.phone,
                metadata: {
                    ...patientData.profile,
                    ...patientData.medical
                }
            };
            delete updatePayload.metadata.name;
            delete updatePayload.metadata.phone;
            delete updatePayload.metadata.email;

            const res = await api.put('/auth/profile', updatePayload);
            setUser(res.data.data);
            setIsGlobalEdit(false);
            alert('Profile updated successfully');
            window.location.reload();
        } catch (err) {
            console.error('Failed to update profile', err);
            alert(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('photo', file);

        setUploadingPhoto(true);
        try {
            const res = await api.put('/auth/profile-photo', formData);
            setUser(res.data.data);
            alert('Profile photo updated successfully');
        } catch (err) {
            console.error('Photo upload failed', err);
            alert(err.response?.data?.error || 'Photo upload failed. Ensure file is an image under 5MB.');
        } finally {
            setUploadingPhoto(false);
        }
    };

    // Calendar & Doctor State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);

    const fetchAuthorizedDocs = async () => {
        try {
            const res = await api.get('/records/access/authorized');
            setDoctors(res.data.data || []);
        } catch (err) {
            console.error('Error fetching doctors');
        }
    };

    const fetchAppointments = async () => {
        try {
            const res = await api.get('/appointments/patient/upcoming');
            setAppointments(res.data.data || []);
        } catch (err) {
            console.error('Error fetching appointments');
        }
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push({ day: null, currentMonth: false });
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const hasApt = appointments.find(a => {
                const apptDate = new Date(a.date).toISOString().split('T')[0];
                return apptDate === dateStr;
            });
            days.push({ day: i, currentMonth: true, dateStr, hasApt });
        }
        return days;
    }, [currentDate, appointments]);

    const updateField = (category, field, value) => {
        setPatientData(prev => ({
            ...prev,
            [category]: { ...prev[category], [field]: value }
        }));
    };

    const updateLifestyle = (field, value) => {
        setPatientData(prev => ({
            ...prev,
            medical: { ...prev.medical, lifestyle: { ...prev.medical.lifestyle, [field]: value } }
        }));
    };

    const deleteAppointment = (dateStr) => {
        setAppointments(prev => prev.filter(appt => appt.date !== dateStr));
    };

    const handleDateClick = (d) => {
        if (!d.currentMonth) return;
        if (d.hasApt) {
            if (window.confirm(`Delete appointment on ${d.dateStr}?`)) {
                deleteAppointment(d.dateStr);
            }
        } else {
            setSelectedDate(d.dateStr);
            setIsAppointmentModalOpen(true);
        }
    };

    return (
        <div className="space-y-8 pb-12 max-w-7xl mx-auto">
            {/* Header / Profile Identity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-8 bg-white rounded-2xl p-6 lg:p-10 shadow-sm border border-slate-200"
                >
                    <div className="space-y-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                            <div className="space-y-4 w-full">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    {isGlobalEdit ? (
                                        <input
                                            className="text-2xl lg:text-3xl font-bold text-slate-900 bg-slate-50 rounded-xl px-4 py-3 outline-none border-b-2 border-emerald-500 flex-1 shadow-inner placeholder:text-slate-300"
                                            value={patientData.profile.name}
                                            onChange={(e) => updateField('profile', 'name', e.target.value)}
                                            placeholder="Enter Full Name"
                                        />
                                    ) : (
                                        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">{patientData.profile.name || "Set Name"}</h1>
                                    )}

                                    <div className="flex gap-2">
                                        {isGlobalEdit ? (
                                            <>
                                                <button
                                                    onClick={handleSave}
                                                    disabled={isSaving}
                                                    className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-md flex items-center gap-2 font-bold text-xs disabled:opacity-50"
                                                >
                                                    {isSaving ? <Activity size={14} className="animate-spin" /> : <Save size={14} />}
                                                    <span>Save Profile</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsGlobalEdit(false);
                                                        fetchProfile();
                                                    }}
                                                    className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all font-bold text-xs"
                                                >
                                                    Discard
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => setIsGlobalEdit(true)}
                                                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-black transition-all shadow-md flex items-center gap-2 font-bold text-xs"
                                            >
                                                <Edit2 size={14} />
                                                Edit Profile
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-emerald-100">Verified Patient Entity</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Insurace ID: {patientData.profile.insuranceID || 'Pending Validation'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8 border-t border-slate-100">
                            <DetailInput label="Patient Age" value={patientData.profile.age || "Not Set"} isEdit={isGlobalEdit} onUpdate={(v) => updateField('profile', 'age', v)} icon={User} />
                            <DetailInput label="Gender Identity" value={patientData.profile.gender || "Not Set"} isEdit={isGlobalEdit} onUpdate={(v) => updateField('profile', 'gender', v)} icon={User} />
                            <DetailInput label="Phone Number" value={patientData.profile.phone || "Not Set"} isEdit={isGlobalEdit} onUpdate={(v) => updateField('profile', 'phone', v)} icon={Phone} />
                            <DetailInput label="Email Access" value={patientData.profile.email || "Not Set"} isEdit={isGlobalEdit} onUpdate={(v) => updateField('profile', 'email', v)} icon={Zap} />
                            <DetailInput label="Home Address" value={patientData.profile.address || "Not Set"} isEdit={isGlobalEdit} onUpdate={(v) => updateField('profile', 'address', v)} icon={MapPin} />
                            <DetailInput label="Professional Role" value={patientData.profile.occupation || "Not Set"} isEdit={isGlobalEdit} onUpdate={(v) => updateField('profile', 'occupation', v)} icon={Briefcase} />
                            <DetailInput label="Emergency Contact" value={patientData.profile.emergencyContact || "Not Set"} isEdit={isGlobalEdit} onUpdate={(v) => updateField('profile', 'emergencyContact', v)} icon={AlertCircle} color="rose" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-4 bg-slate-50 rounded-2xl p-8 border border-slate-200 flex flex-col items-center justify-center gap-6"
                >
                    <div className="relative">
                        <div className="w-40 h-40 lg:w-48 lg:h-48 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm relative">
                            {user?.profilePhoto ? (
                                <img
                                    src={(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/' + user.profilePhoto}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex flex-col items-center text-slate-300">
                                    <User className="w-16 h-16" />
                                    <span className="text-[10px] font-bold mt-2 uppercase tracking-tighter">No Identity Image</span>
                                </div>
                            )}
                            {uploadingPhoto && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                    <Activity className="animate-spin text-emerald-600" />
                                </div>
                            )}
                        </div>
                        <label className="absolute -bottom-3 -right-3 p-3 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 cursor-pointer transition-all active:scale-95 border-2 border-white">
                            <Upload size={18} />
                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                        </label>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medical Portrait</p>
                        <p className="text-sm font-bold text-emerald-600 mt-1">Verified Clinical Identity</p>
                    </div>
                </motion.div>
            </div>

            {/* Medical Metrics Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <MetricCard label="Blood Pressure" value={patientData.medical.bp || "N/A"} icon={Activity} color="emerald" isEdit={isGlobalEdit} onUpdate={(v) => updateField('medical', 'bp', v)} />
                <MetricCard label="Allergy Status" value={patientData.medical.allergies || "None"} icon={AlertCircle} color="rose" isEdit={isGlobalEdit} onUpdate={(v) => updateField('medical', 'allergies', v)} />
                <MetricCard label="Blood Group" value={patientData.profile.bloodGroup || "Pending"} icon={Droplets} color="emerald" isEdit={isGlobalEdit} onUpdate={(v) => updateField('profile', 'bloodGroup', v)} />
                <MetricCard label="Current Weight" value={patientData.medical.weight || "N/A"} icon={ScaleIcon} color="amber" isEdit={isGlobalEdit} onUpdate={(v) => updateField('medical', 'weight', v)} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Recent Records Section */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Recent Medical Documents</h2>
                        <Link to="/dashboard/patient/records" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                            Browse All Records <ChevronRight size={14} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            [1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-50 rounded-2xl animate-pulse border border-slate-100" />)
                        ) : recentRecords.length > 0 ? (
                            recentRecords.map(record => (
                                <div key={record._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                            <FileText size={16} />
                                        </div>
                                        <span className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">{record.recordType}</span>
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-emerald-600 transition-colors">{record.title}</h4>
                                    <p className="text-[10px] text-slate-400 mt-1">{new Date(record.createdAt).toLocaleDateString()}</p>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center flex flex-col items-center">
                                <FileText size={24} className="text-slate-300 mb-2" />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Recent Activity Discovered</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <BioTextSection label="Surgical History" value={patientData.medical.pastSurgeries || "None"} isEdit={isGlobalEdit} onUpdate={(v) => updateField('medical', 'pastSurgeries', v)} icon={Clipboard} />
                        <BioTextSection label="Family Medical History" value={patientData.medical.familyHistory || "None"} isEdit={isGlobalEdit} onUpdate={(v) => updateField('medical', 'familyHistory', v)} icon={Heart} />
                    </div>
                </motion.div>

                {/* Calendar / Appointments Sidebar */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-900 text-lg tracking-tight">Clinical Calendar</h3>
                            <div className="flex gap-1">
                                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"><ChevronLeft size={16} /></button>
                                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"><ChevronRight size={16} /></button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="text-center font-bold text-xs text-slate-900 underline decoration-emerald-500 decoration-2 underline-offset-4 uppercase tracking-widest mb-4">
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => <div key={`${d}-${idx}`} className="text-[9px] font-bold text-slate-300 py-1 uppercase">{d}</div>)}
                                {calendarDays.map((d, i) => (
                                    <div
                                        key={i}
                                        onClick={() => handleDateClick(d)}
                                        className={`aspect-square flex items-center justify-center text-[10px] rounded-lg cursor-pointer transition-all relative
                                            ${!d.currentMonth ? 'opacity-0' : 'hover:bg-emerald-50 text-slate-600'}
                                            ${d.hasApt ? 'bg-emerald-600 text-white font-bold' : ''}
                                            ${d.dateStr === new Date().toISOString().split('T')[0] ? 'border border-emerald-500' : ''}
                                        `}
                                    >
                                        {d.day}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setIsAppointmentModalOpen(true)}
                            className="w-full mt-6 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-md flex items-center justify-center gap-2"
                        >
                            Request Scheduling <ArrowUpRight size={14} />
                        </button>
                    </div>

                    <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Zap size={16} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm tracking-tight">Active Practitioners</h4>
                                <p className="text-[10px] text-emerald-100">Authorized medical access</p>
                            </div>
                        </div>
                        <div className="flex -space-x-3 overflow-hidden mb-6">
                            {doctors.map(doc => (
                                <div key={doc._id} className="inline-block h-8 w-8 rounded-full ring-2 ring-emerald-600 bg-slate-100 flex items-center justify-center text-xs font-bold text-emerald-600 border border-emerald-500">
                                    {doc.fullName?.charAt(0) || 'D'}
                                </div>
                            ))}
                            {doctors.length === 0 && <span className="text-[10px] text-emerald-100 italic">No specialists linked yet</span>}
                        </div>
                        <Link to="/dashboard/patient/doctors" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:translate-x-1 transition-transform">
                            Manage Permissions <ChevronRight size={12} />
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Appointment Modal */}
            <AnimatePresence>
                {isAppointmentModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAppointmentModalOpen(false)} className="absolute inset-0" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative bg-white w-full max-w-sm rounded-2xl p-8 shadow-2xl space-y-6 border border-slate-200"
                        >
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Request Appointment</h3>
                                <p className="text-xs text-slate-400 mt-1">Proposed Clinical Date: {selectedDate}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Select Practitioner</label>
                                    <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-500 appearance-none">
                                        {doctors.map(d => <option key={d._id} value={d._id}>{d.fullName}</option>)}
                                        {doctors.length === 0 && <option>No Doctors Available</option>}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Preferred Protocol</label>
                                    <input type="time" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-500" />
                                </div>
                            </div>

                            <button
                                onClick={() => setIsAppointmentModalOpen(false)}
                                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md"
                            >
                                Submit Request
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Sub Components ---

const DetailInput = ({ label, value, isEdit, onUpdate, icon: Icon, color = "emerald" }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Icon size={12} className={color === 'rose' ? 'text-rose-500' : 'text-emerald-600'} />
            {label}
        </label>
        {isEdit ? (
            <input
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 shadow-sm"
                value={value}
                onChange={(e) => onUpdate(e.target.value)}
            />
        ) : (
            <div className="text-sm font-bold text-slate-900 py-1 px-1 truncate">{value}</div>
        )}
    </div>
);

const MetricCard = ({ label, value, icon: Icon, color, isEdit, onUpdate }) => {
    const styles = {
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        rose: "bg-rose-50 text-rose-600 border-rose-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100"
    };
    return (
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-center">
            <div className={`p-3 rounded-xl mb-3 ${styles[color]}`}>
                <Icon size={20} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
            {isEdit ? (
                <input
                    className="w-full mt-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-center text-slate-900 focus:border-emerald-500 outline-none"
                    value={value === "N/A" || value === "None" || value === "Pending" ? "" : value}
                    onChange={(e) => onUpdate(e.target.value)}
                    placeholder="Enter value..."
                />
            ) : (
                <p className="text-xl font-bold text-slate-900 mt-1">{value}</p>
            )}
        </div>
    );
};

const BioTextSection = ({ label, value, isEdit, onUpdate, icon: Icon }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
            <Icon size={16} className="text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">{label}</h3>
        </div>
        {isEdit ? (
            <textarea
                className="w-full h-24 bg-slate-50 p-3 rounded-xl text-sm font-bold resize-none outline-none border border-slate-200 focus:border-emerald-500"
                value={value}
                onChange={(e) => onUpdate(e.target.value)}
            />
        ) : (
            <p className="text-sm font-medium text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl min-h-[80px]">{value}</p>
        )}
    </div>
);

const ScaleIcon = ({ size }) => <Activity size={size} />; // Placeholder for Scale icon

export default PatientProfile;
