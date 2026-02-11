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
    Trash2
} from 'lucide-react';

const PatientProfile = () => {
    const { user, setUser } = useAuth();
    const [isGlobalEdit, setIsGlobalEdit] = useState(false);
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [loading, setLoading] = useState(true);

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
        } catch (err) {
            console.error('Error fetching profile');
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
                profilePic: userData.metadata?.profilePic || null,
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
        } catch (err) {
            console.error('Failed to update profile', err);
            alert('Failed to update profile');
        }
    };

    // Calendar & Doctor State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);

    useEffect(() => {
        fetchAuthorizedDocs();
        fetchAppointments();
    }, []);

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
        <div className="space-y-10 pb-12">
            {/* TOP ROW: Patient Details (Left) | Image Upload (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-8 bg-white rounded-[50px] p-12 shadow-xl border border-slate-50 relative overflow-hidden group"
                >
                    <div className="relative z-10 space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-4 w-full">
                                <div className="flex items-center gap-4">
                                    {isGlobalEdit ? (
                                        <input
                                            className="text-4xl lg:text-6xl font-black text-slate-900 bg-slate-50 rounded-[25px] px-8 py-5 outline-none border-b-4 border-emerald-500 flex-1 shadow-inner h-24"
                                            value={patientData.profile.name}
                                            onChange={(e) => updateField('profile', 'name', e.target.value)}
                                        />
                                    ) : (
                                        <h1 className="text-4xl lg:text-7xl font-black text-slate-900 tracking-tighter">{patientData.profile.name}</h1>
                                    )}
                                    <button
                                        onClick={() => {
                                            if (isGlobalEdit) {
                                                handleSave();
                                            } else {
                                                setIsGlobalEdit(true);
                                            }
                                        }}
                                        className="p-4 bg-slate-900 text-white rounded-2xl hover:scale-110 transition-all shadow-xl flex-shrink-0"
                                    >
                                        {isGlobalEdit ? <Save size={24} /> : <Settings size={24} />}
                                    </button>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="px-4 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-widest rounded-full">Patient Profile Registry</span>
                                    <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Insurance ID: {patientData.profile.insuranceID}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-12 pt-10 border-t border-slate-50">
                            <DetailInput label="Age / Gender" value={(patientData.profile.age || patientData.profile.gender) ? `${patientData.profile.age} / ${patientData.profile.gender}` : "PENDING_IDENTITY"} isEdit={isGlobalEdit} onUpdate={(v) => {
                                const [age, gender] = v.split('/').map(s => s.trim());
                                updateField('profile', 'age', age);
                                updateField('profile', 'gender', gender);
                            }} icon={User} />
                            <DetailInput label="Primary Contact" value={patientData.profile.phone || "UNLINKED_TERMINAL"} isEdit={isGlobalEdit} onUpdate={(v) => updateField('profile', 'phone', v)} icon={Phone} />
                            <DetailInput label="EMAIL ACCESS" value={patientData.profile.email || "NO_TARGET_ADDRESS"} isEdit={isGlobalEdit} onUpdate={(v) => updateField('profile', 'email', v)} icon={Zap} />
                            <DetailInput label="Home Address" value={patientData.profile.address || "LOCATION_ISOLATED"} isEdit={isGlobalEdit} onUpdate={(v) => updateField('profile', 'address', v)} icon={MapPin} />
                            <DetailInput label="Professional Role" value={patientData.profile.occupation || "ROLE_UNASSIGNED"} isEdit={isGlobalEdit} onUpdate={(v) => updateField('profile', 'occupation', v)} icon={Briefcase} />
                            <DetailInput label="Emergency Alert" value={patientData.profile.emergencyContact || "NO_FAILSAFE_CONTACT"} isEdit={isGlobalEdit} onUpdate={(v) => updateField('profile', 'emergencyContact', v)} icon={AlertCircle} color="rose" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-4 bg-slate-50 rounded-[50px] p-12 shadow-inner border border-slate-100 flex flex-col items-center justify-center gap-10 relative group"
                >
                    <div className="relative">
                        <div className="w-48 h-48 lg:w-56 lg:h-56 rounded-[50px] bg-white border-4 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shadow-xl transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                            <User className="w-24 h-24 text-slate-100" />
                        </div>
                        <label className="absolute -bottom-4 -right-4 p-6 bg-slate-900 text-white rounded-[25px] shadow-2xl hover:bg-black cursor-pointer hover:scale-110 transition-all active:scale-95">
                            <Upload size={32} />
                            <input type="file" className="hidden" />
                        </label>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Biometric Portrait</p>
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-3">Verified Clinical ID</p>
                    </div>
                </motion.div>
            </div>

            {/* MIDDLE ROW: Medical Data (Full Width Grid) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                <div className="flex items-center justify-between px-6">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-6">
                        <Clipboard className="text-emerald-500" size={40} />
                        CLINICAL DOSSIER
                    </h2>
                    <div className="flex gap-8">
                        <VitalTab value={patientData.medical.bp ? "98%" : "N/A"} label="HEALTH INDEX" color="emerald" />
                        <VitalTab value={patientData.medical.bp ? "STABLE" : "INIT"} label="SYSTEM STATE" color="emerald" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <BioCard label="Current Prescriptions" value={patientData.medical.medication || "NO_ACTIVE_SCRIPTS"} icon={Activity} color="emerald" isEdit={isGlobalEdit} onUpdate={(v) => updateField('medical', 'medication', v)} />
                    <BioCard label="Immunological Factors" value={patientData.medical.allergies || "CLEAR_STATUS"} icon={AlertCircle} color="rose" isEdit={isGlobalEdit} onUpdate={(v) => updateField('medical', 'allergies', v)} />
                    <BioCard label="BP & BLOOD SYSTEM" value={(patientData.medical.bp || patientData.profile.bloodGroup) ? `${patientData.medical.bp} | ${patientData.profile.bloodGroup}` : "UNSTABLE_VALUES"} icon={Droplets} color="emerald" isEdit={isGlobalEdit} onUpdate={(v) => {
                        const [bp, bg] = v.split('|').map(s => s.trim());
                        updateField('medical', 'bp', bp);
                        updateField('profile', 'bloodGroup', bg);
                    }} />
                    <BioCard label="Physique Metrics" value={(patientData.medical.height || patientData.medical.weight) ? `${patientData.medical.height} | ${patientData.medical.weight}` : "METRICS_PENDING"} icon={Zap} color="amber" isEdit={isGlobalEdit} onUpdate={(v) => {
                        const [h, w] = v.split('|').map(s => s.trim());
                        updateField('medical', 'height', h);
                        updateField('medical', 'weight', w);
                    }} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-4 bg-white rounded-[50px] p-10 shadow-xl border border-slate-50 space-y-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-[40px] -mr-16 -mt-16 opacity-40" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 border-l-4 border-emerald-500 pl-4 relative z-10">LIFESTYLE PARAMETERS</h3>
                        <div className="space-y-8 relative z-10">
                            <HabitItem label="Smoking Status" value={patientData.medical.lifestyle.smoking} icon={Zap} isEdit={isGlobalEdit} onUpdate={(v) => updateLifestyle('smoking', v)} />
                            <HabitItem label="Alcohol Intake" value={patientData.medical.lifestyle.alcohol} icon={LifeBuoy} isEdit={isGlobalEdit} onUpdate={(v) => updateLifestyle('alcohol', v)} />
                            <HabitItem label="Nutrition Plan" value={patientData.medical.lifestyle.diet} icon={Pizza} isEdit={isGlobalEdit} onUpdate={(v) => updateLifestyle('diet', v)} />
                            <HabitItem label="Circadian Cycle" value={patientData.medical.lifestyle.sleep} icon={Clock} isEdit={isGlobalEdit} onUpdate={(v) => updateLifestyle('sleep', v)} />
                        </div>
                    </div>
                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <TextSection label="SURGICAL TIMELINE" value={patientData.medical.pastSurgeries || "NO_RECORDED_HISTORY"} isEdit={isGlobalEdit} onUpdate={(v) => updateField('medical', 'pastSurgeries', v)} color="slate" />
                        <TextSection label="GENETIC ANCESTRY" value={patientData.medical.familyHistory || "NO_GENETIC_MARKERS"} isEdit={isGlobalEdit} onUpdate={(v) => updateField('medical', 'familyHistory', v)} color="emerald" />
                        <TextSection label="IMMUNIZATION TIMELINE" value={patientData.medical.immunization || "VACCINATION_PENDING"} isEdit={isGlobalEdit} onUpdate={(v) => updateField('medical', 'immunization', v)} color="emerald" />
                        <TextSection label="SYMPTOM OBSERVATIONS" value={patientData.medical.symptoms || "NO_ACTIVE_SYMPTOMS"} isEdit={isGlobalEdit} onUpdate={(v) => updateField('medical', 'symptoms', v)} color="amber" />
                    </div>
                </div>
            </motion.div>

            {/* BOTTOM ROW: Doctor (Left) | Calendar (Bottom Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-8 space-y-8"
                >
                    <div className="flex justify-between items-center px-6">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase border-l-8 border-emerald-500 pl-8">RESOURCE_DIR</h2>
                        <button className="p-5 bg-slate-900 text-white rounded-[20px] hover:rotate-6 transition-all shadow-3xl">
                            <Plus size={28} />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
                        {doctors.map(doc => (
                            <DoctorFolderCard key={doc._id} doc={doc} />
                        ))}
                        {doctors.length === 0 && (
                            <div className="col-span-4 py-12 text-center bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Authorized Practitioners Found</p>
                            </div>
                        )}
                    </div>
                </motion.section>

                <motion.aside
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-4 bg-slate-50 rounded-[50px] p-10 lg:p-12 shadow-inner border border-slate-200 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full blur-[60px] -mr-24 -mt-24 opacity-60 group-hover:scale-125 transition-transform duration-1000" />
                    <div className="relative z-10 space-y-10">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-black text-slate-800 tracking-tighter">PLANNING UNIT</h3>
                            <div className="flex gap-4">
                                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="p-3 bg-white shadow-sm hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all"><ChevronLeft size={20} /></button>
                                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="p-3 bg-white shadow-sm hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all"><ChevronRight size={20} /></button>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-500 pb-4 border-b border-slate-200">
                                <span className="text-slate-900 font-black">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                                <span className="text-emerald-600 font-black">OPERATIONAL</span>
                            </div>
                            <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-center">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-[10px] font-black text-slate-300 pb-2">{d}</div>)}
                                {calendarDays.map((d, i) => (
                                    <div
                                        key={i}
                                        onClick={() => handleDateClick(d)}
                                        className={`aspect-square flex items-center justify-center text-[11px] rounded-xl cursor-pointer transition-all relative group/day
                      ${!d.currentMonth ? 'opacity-0 pointer-events-none' : 'hover:bg-white hover:shadow-sm text-slate-600'}
                      ${d.hasApt ? 'text-slate-900 font-black' : 'font-bold'}
                      ${d.dateStr === new Date().toISOString().split('T')[0] ? 'bg-slate-200/50 text-slate-900' : ''}
                    `}
                                    >
                                        <span className="relative z-10">{d.day}</span>
                                        {d.hasApt && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute inset-1 border-2 border-emerald-500 rounded-lg z-0"
                                            />
                                        )}
                                        {d.hasApt && (
                                            <div className="absolute -top-1 -right-1 bg-rose-500 w-4 h-4 rounded-full border border-white flex items-center justify-center opacity-0 group-hover/day:opacity-100 transition-opacity z-20">
                                                <X size={8} className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={() => setIsAppointmentModalOpen(true)}
                            className="w-full py-6 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-3xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3"
                        >
                            REQUEST CONSULTATION
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </motion.aside>
            </div>

            {/* Appointment Modal */}
            <AnimatePresence>
                {isAppointmentModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAppointmentModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-lg" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="relative bg-white w-full max-w-md rounded-[50px] p-12 shadow-4xl space-y-10 border border-slate-100"
                        >
                            <div className="space-y-4">
                                <h3 className="text-4xl font-black tracking-tighter">Clinical Entry</h3>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Registering for {selectedDate}</p>
                            </div>
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase text-slate-400 ml-1">Assigned Specialist</label>
                                    <select className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-3xl text-sm font-black appearance-none outline-none shadow-inner">
                                        {doctors.map(d => <option key={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase text-slate-400 ml-1">Preferred Slot</label>
                                        <input type="time" className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-3xl text-sm font-black outline-none shadow-inner" />
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setAppointments([...appointments, { id: Date.now(), date: selectedDate, time: "TBD", doctor: "Pending", type: "General", icon: "🏥" }]);
                                    setIsAppointmentModalOpen(false);
                                }}
                                className="w-full py-7 bg-emerald-600 text-white font-black rounded-[30px] shadow-2xl text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all border-b-4 border-emerald-800"
                            >
                                DEPLOY APPOINTMENT
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
    <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
            <Icon size={16} className={`text-${color}-600`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{label}</span>
        </div>
        {isEdit ? (
            <input className="w-full p-3 bg-emerald-50 rounded-2xl text-sm font-black text-slate-900 outline-none border-b-2 border-emerald-500 shadow-sm" value={value} onChange={(e) => onUpdate(e.target.value)} />
        ) : (
            <div className="w-full p-3 bg-slate-50 rounded-2xl text-sm font-bold text-slate-800 truncate border border-transparent hover:border-slate-100 transition-all">{value}</div>
        )}
    </div>
);

const BioCard = ({ label, value, icon: Icon, color, isEdit, onUpdate }) => {
    const styles = {
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
        rose: "bg-rose-50 text-rose-600 border-rose-200",
        amber: "bg-amber-50 text-amber-600 border-amber-200"
    };
    return (
        <div className={`p-6 rounded-[35px] bg-white shadow-lg flex flex-col items-center text-center gap-4 transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer group border border-slate-50`}>
            <div className={`w-16 h-16 rounded-2xl ${styles[color]} border-2 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                <Icon size={28} />
            </div>
            <div className="space-y-2 w-full">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{label}</p>
                {isEdit ? (
                    <textarea className="w-full text-center text-sm font-black bg-slate-50 p-2 rounded-xl border-b-2 border-emerald-500 resize-none outline-none h-16" value={value} onChange={(e) => onUpdate(e.target.value)} />
                ) : (
                    <p className="text-base font-black text-slate-900 leading-tight h-8 flex items-center justify-center">{value}</p>
                )}
            </div>
        </div>
    );
};

const HabitItem = ({ label, value, icon: Icon, isEdit, onUpdate }) => (
    <div className="flex items-center gap-5 group">
        <div className="w-12 h-12 rounded-xl bg-white border-2 border-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all shadow-sm">
            <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{label}</p>
            {isEdit ? (
                <input className="w-full text-sm font-bold bg-transparent border-b-2 border-slate-100 focus:border-emerald-500 outline-none transition-all py-1.5" value={value} onChange={(e) => onUpdate(e.target.value)} />
            ) : (
                <p className="text-base font-bold text-slate-800 truncate">{value}</p>
            )}
        </div>
    </div>
);

const TextSection = ({ label, value, isEdit, onUpdate, color }) => (
    <div className="bg-white p-8 rounded-[35px] shadow-lg border border-slate-50 space-y-4">
        <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 border-b-2 border-slate-50 pb-3`}>{label}</h3>
        {isEdit ? (
            <textarea className="w-full h-28 bg-slate-50 p-4 rounded-2xl text-sm font-bold resize-none outline-none border-2 border-transparent focus:border-emerald-500 shadow-inner" value={value} onChange={(e) => onUpdate(e.target.value)} />
        ) : (
            <p className="text-sm font-bold text-slate-700 leading-relaxed bg-slate-50/50 p-6 rounded-[25px] min-h-[90px]">{value}</p>
        )}
    </div>
);

const VitalTab = ({ label, value, color }) => (
    <div className={`px-8 py-4 rounded-2xl bg-${color}-50 border border-${color}-100 flex flex-col items-center justify-center shadow-sm min-w-[140px]`}>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{label}</span>
        <span className={`text-3xl font-black text-slate-900 tracking-tighter`}>{value}</span>
    </div>
);

const DoctorFolderCard = ({ doc }) => (
    <Link to={`/dashboard/patient/doctors?doctorId=${doc._id}`} className="block">
        <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col items-center gap-4 cursor-pointer group">
            <div className="w-full aspect-[4/3] relative">
                <div className="absolute inset-0 bg-[#FFD966] rounded-2xl border-2 border-slate-200 shadow-sm">
                    <div className="w-1/2 h-4 bg-[#FFD966] rounded-t-[12px] -mt-3.5 ml-4 border-t-2 border-x-2 border-slate-200" />
                </div>
                <div className="absolute inset-x-0 bottom-0 top-3 bg-[#FFE599] rounded-[20px] shadow-lg border-t-2 border-white/40 transform origin-bottom group-hover:rotate-x-12 transition-transform duration-500 flex flex-col items-center justify-center p-4">
                    <div className="text-4xl drop-shadow-md group-hover:scale-110 transition-transform">👨‍⚕️</div>
                </div>
            </div>
            <div className="text-center w-full px-2">
                <p className="text-[11px] font-black text-slate-900 truncate uppercase tracking-tighter">Dr. {(doc.fullName || 'Specialist').replace('Dr. ', '').split(' ')[0]}</p>
                <p className="text-[9px] font-bold text-emerald-700 opacity-60 uppercase tracking-widest truncate">{doc.metadata?.specialization || doc.metadata?.specialty || 'Medical Specialist'}</p>
            </div>
        </motion.div>
    </Link>
);

export default PatientProfile;
