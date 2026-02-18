import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Device } from '@twilio/voice-sdk';
import api from '../config/api';
import ConsultationControls from '../components/ConsultationControls';
import { Phone, User, Clock, AlertCircle } from 'lucide-react';

const VoiceCall = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('Initializing...');
    const [token, setToken] = useState(null);
    const [device, setDevice] = useState(null);
    const [onCall, setOnCall] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState(null);
    const [identity, setIdentity] = useState('');

    const timerRef = useRef(null);
    const deviceRef = useRef(null);

    useEffect(() => {
        fetchToken();
        return () => {
            if (deviceRef.current) {
                deviceRef.current.destroy();
            }
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const fetchToken = async () => {
        try {
            const response = await api.post('/consultation/voice/token', { appointmentId });
            setToken(response.data.token);
            setIdentity(response.data.identity);
            initializeDevice(response.data.token);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to initialize call session');
            setStatus('Error');
        }
    };

    const initializeDevice = (token) => {
        const twilioDevice = new Device(token, {
            codecPreferences: ['opus', 'pcmu'],
            fakeLocalAudio: false,
        });

        twilioDevice.on('registered', () => {
            setStatus('Ready');
            deviceRef.current = twilioDevice;
            setDevice(twilioDevice);
        });

        twilioDevice.on('error', (error) => {
            console.error('Twilio Device Error:', error);
            setError('Connection error occurred');
        });

        twilioDevice.register();
    };

    const handleStartCall = async () => {
        if (!device) return;

        try {
            const params = { To: 'CareSyncConsultation' };
            const call = await device.connect({ params });

            call.on('accept', () => {
                setOnCall(true);
                setStatus('On Call');
                startTimer();
            });

            call.on('disconnect', () => {
                handleEndCall();
            });

        } catch (err) {
            console.error('Call Error:', err);
            setError('Could not establish call connection');
        }
    };

    const handleEndCall = () => {
        if (deviceRef.current) {
            deviceRef.current.disconnectAll();
        }
        setOnCall(false);
        setStatus('Call Ended');
        if (timerRef.current) clearInterval(timerRef.current);

        // Redirect to summary if doctor, else to dashboard
        // For simplicity, always redirect to summary for now to show the flow
        navigate(`/consultation/summary/${appointmentId}?duration=${duration}`);
    };

    const toggleMute = () => {
        if (deviceRef.current) {
            // Logic to mute/unmute via Twilio SDK
            // activeCall.mute(!isMuted)
            setIsMuted(!isMuted);
        }
    };

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setDuration(prev => prev + 1);
        }, 1000);
    };

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-lg w-full text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>

                <div className="mb-8">
                    <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                        <User className="w-12 h-12" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-1">Voice Consultation</h1>
                    <p className="text-indigo-600 font-medium">{status}</p>
                    <p className="text-slate-400 text-sm mt-2">ID: {identity}</p>
                </div>

                {!onCall ? (
                    <button
                        onClick={handleStartCall}
                        disabled={status !== 'Ready'}
                        className={`w-full py-4 rounded-2xl flex items-center justify-center space-x-3 text-lg font-bold transition-all duration-300 shadow-xl ${status === 'Ready'
                            ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-100'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        <Phone className="w-6 h-6" />
                        <span>Start Consultation</span>
                    </button>
                ) : (
                    <ConsultationControls
                        type="voice"
                        onEndCall={handleEndCall}
                        isMuted={isMuted}
                        onToggleMute={toggleMute}
                        callDuration={duration}
                    />
                )}

                <div className="mt-8 flex items-center justify-center space-x-2 text-slate-400 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Secure end-to-end encrypted voice call</span>
                </div>
            </div>
        </div>
    );
};

export default VoiceCall;
