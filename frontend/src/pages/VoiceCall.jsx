import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Device } from '@twilio/voice-sdk';
import api from '../config/api';
import ConsultationControls from '../components/ConsultationControls';
import { Phone, PhoneOff, PhoneIncoming, User, Clock, AlertCircle, Mic, MicOff } from 'lucide-react';

const VoiceCall = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState('Initializing...');
    const [onCall, setOnCall] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState(null);
    const [identity, setIdentity] = useState('');
    const [peerIdentity, setPeerIdentity] = useState('');

    // Incoming call state
    const [incomingCall, setIncomingCall] = useState(null); // holds the Twilio Call object
    const [callerName, setCallerName] = useState('');

    const timerRef = useRef(null);
    const deviceRef = useRef(null);
    const activeCallRef = useRef(null);

    useEffect(() => {
        fetchToken();
        return () => {
            if (deviceRef.current) deviceRef.current.destroy();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // ─── Token Fetch ───────────────────────────────────────────────────────────
    const fetchToken = async () => {
        console.log('[VoiceCall] fetchToken() — appointmentId:', appointmentId);
        try {
            const response = await api.post('/consultation/voice/token', { appointmentId });
            const { token, identity: myId, peerIdentity: peerId } = response.data;
            console.log('[VoiceCall] Token OK — me:', myId, '| peer:', peerId);
            setIdentity(myId);
            setPeerIdentity(peerId);
            initializeDevice(token, peerId);
        } catch (err) {
            console.error('[VoiceCall] Token fetch FAILED', err.response?.status, err.response?.data);
            setError(err.response?.data?.message || 'Failed to initialize call session');
            setStatus('Error');
        }
    };

    // ─── Device Init ───────────────────────────────────────────────────────────
    const initializeDevice = (token, peerId) => {
        console.log('[VoiceCall] initializeDevice() — peer will be:', peerId);

        const twilioDevice = new Device(token, {
            codecPreferences: ['opus', 'pcmu'],
            fakeLocalAudio: false,
        });

        twilioDevice.on('registering', () => {
            console.log('[VoiceCall] registering...');
            setStatus('Connecting...');
        });

        twilioDevice.on('registered', () => {
            console.log('[VoiceCall] registered — READY');
            setStatus('Ready');
            deviceRef.current = twilioDevice;
        });

        twilioDevice.on('unregistered', () => {
            console.warn('[VoiceCall] unregistered');
            setStatus('Disconnected');
        });

        // ── INCOMING CALL handler ──────────────────────────────────────────────
        // This fires when the OTHER person calls us. Show accept/reject UI.
        twilioDevice.on('incoming', (call) => {
            const from = call.parameters?.From || 'Unknown Caller';
            console.log('[VoiceCall] INCOMING CALL from:', from);
            setCallerName(from.replace('client:', ''));
            setIncomingCall(call);
            setStatus('Incoming Call...');

            // If they hang up before we answer
            call.on('cancel', () => {
                console.log('[VoiceCall] Incoming call cancelled by caller');
                setIncomingCall(null);
                setCallerName('');
                setStatus('Ready');
            });
        });

        twilioDevice.on('error', (twilioError) => {
            console.error('[VoiceCall] Device error:', twilioError?.code, twilioError?.message);
            console.error('[VoiceCall] causes:', twilioError?.causes);
            console.error('[VoiceCall] solutions:', twilioError?.solutions);
            const msg = twilioError?.message || 'Twilio Device error — see browser console';
            setError(`Voice connection failed: ${msg}`);
        });

        twilioDevice.register();
        console.log('[VoiceCall] .register() called');
    };

    // ─── Accept Incoming Call ─────────────────────────────────────────────────
    const handleAcceptCall = () => {
        if (!incomingCall) return;
        console.log('[VoiceCall] Accepting incoming call...');
        incomingCall.accept();
        activeCallRef.current = incomingCall;
        setIncomingCall(null);
        setOnCall(true);
        setStatus('On Call');
        startTimer();

        incomingCall.on('disconnect', () => {
            console.log('[VoiceCall] Call disconnected');
            handleEndCall();
        });
    };

    // ─── Reject Incoming Call ─────────────────────────────────────────────────
    const handleRejectCall = () => {
        if (!incomingCall) return;
        console.log('[VoiceCall] Rejecting incoming call');
        incomingCall.reject();
        setIncomingCall(null);
        setCallerName('');
        setStatus('Ready');
    };

    // ─── Initiate Outgoing Call ───────────────────────────────────────────────
    const handleStartCall = async () => {
        if (!deviceRef.current || !peerIdentity) return;

        console.log('[VoiceCall] Calling peer:', peerIdentity);
        setStatus('Calling ' + peerIdentity + '...');

        try {
            const call = await deviceRef.current.connect({
                params: { To: peerIdentity },
            });
            activeCallRef.current = call;

            call.on('accept', () => {
                console.log('[VoiceCall] Call accepted by peer');
                setOnCall(true);
                setStatus('On Call');
                startTimer();
            });

            call.on('ringing', () => {
                console.log('[VoiceCall] Ringing...');
                setStatus('Ringing...');
            });

            call.on('disconnect', () => {
                console.log('[VoiceCall] Call disconnected');
                handleEndCall();
            });

            call.on('cancel', () => {
                console.log('[VoiceCall] Call cancelled');
                setStatus('Ready');
                activeCallRef.current = null;
            });

        } catch (err) {
            console.error('[VoiceCall] connect() error:', err);
            setError('Could not establish call connection');
        }
    };

    // ─── End Call ─────────────────────────────────────────────────────────────
    const handleEndCall = () => {
        if (deviceRef.current) deviceRef.current.disconnectAll();
        activeCallRef.current = null;
        setOnCall(false);
        setStatus('Call Ended');
        if (timerRef.current) clearInterval(timerRef.current);
        navigate(`/consultation/summary/${appointmentId}?duration=${duration}`);
    };

    // ─── Mute Toggle ─────────────────────────────────────────────────────────
    const toggleMute = () => {
        if (activeCallRef.current) {
            const next = !isMuted;
            activeCallRef.current.mute(next);
            setIsMuted(next);
        }
    };

    const startTimer = () => {
        timerRef.current = setInterval(() => setDuration(prev => prev + 1), 1000);
    };

    const formatDuration = (s) =>
        `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    // ─── Error Screen ─────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Connection Failed</h2>
                    <p className="text-slate-600 mb-6 text-sm">{error}</p>
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

    // ─── Incoming Call Screen ─────────────────────────────────────────────────
    if (incomingCall) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-green-500" />

                    {/* Pulsing ring animation */}
                    <div className="relative flex items-center justify-center mb-6">
                        <div className="absolute w-28 h-28 bg-green-100 rounded-full animate-ping opacity-50" />
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 relative z-10">
                            <PhoneIncoming className="w-12 h-12" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-slate-800 mb-1">Incoming Call</h1>
                    <p className="text-slate-500 mb-1 text-sm">from</p>
                    <p className="text-indigo-600 font-semibold text-lg mb-8">{callerName}</p>

                    <div className="flex gap-4">
                        {/* Reject */}
                        <button
                            onClick={handleRejectCall}
                            className="flex-1 py-4 bg-red-50 text-red-600 border-2 border-red-200 rounded-2xl hover:bg-red-100 transition-all font-bold flex items-center justify-center gap-2"
                        >
                            <PhoneOff className="w-5 h-5" />
                            Decline
                        </button>
                        {/* Accept */}
                        <button
                            onClick={handleAcceptCall}
                            className="flex-1 py-4 bg-green-500 text-white rounded-2xl hover:bg-green-600 transition-all font-bold shadow-lg flex items-center justify-center gap-2"
                        >
                            <Phone className="w-5 h-5" />
                            Accept
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Main Call Screen ─────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-lg w-full text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />

                <div className="mb-8">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${onCall ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'
                        }`}>
                        <User className="w-12 h-12" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-1">Voice Consultation</h1>
                    {peerIdentity && !onCall && (
                        <p className="text-slate-400 text-sm mt-1">Peer: <span className="text-indigo-500 font-medium">{peerIdentity}</span></p>
                    )}
                    {onCall && (
                        <p className="text-green-600 font-mono text-2xl font-bold mt-2">{formatDuration(duration)}</p>
                    )}
                    <p className={`font-medium mt-1 ${onCall ? 'text-green-600' :
                            status === 'Ready' ? 'text-indigo-600' :
                                status.includes('Ringing') || status.includes('Calling') ? 'text-amber-500' :
                                    'text-slate-400'
                        }`}>{status}</p>
                    <p className="text-slate-300 text-xs mt-1">You: {identity}</p>
                </div>

                {!onCall ? (
                    <button
                        onClick={handleStartCall}
                        disabled={status !== 'Ready'}
                        className={`w-full py-4 rounded-2xl flex items-center justify-center space-x-3 text-lg font-bold transition-all duration-300 shadow-xl ${status === 'Ready'
                                ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-100 cursor-pointer'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        <Phone className="w-6 h-6" />
                        <span>{status === 'Ready' ? 'Start Consultation' : status}</span>
                    </button>
                ) : (
                    <div className="space-y-4">
                        {/* Mute toggle */}
                        <button
                            onClick={toggleMute}
                            className={`w-full py-3 rounded-2xl flex items-center justify-center gap-3 font-semibold transition-all ${isMuted
                                    ? 'bg-amber-50 text-amber-600 border-2 border-amber-200'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            {isMuted ? 'Unmute' : 'Mute'}
                        </button>
                        {/* End call */}
                        <button
                            onClick={handleEndCall}
                            className="w-full py-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 flex items-center justify-center gap-3 text-lg font-bold transition-all shadow-xl shadow-red-100"
                        >
                            <PhoneOff className="w-6 h-6" />
                            End Call
                        </button>
                    </div>
                )}

                <div className="mt-8 flex items-center justify-center space-x-2 text-slate-400 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Secure end-to-end encrypted voice call</span>
                </div>
            </div>

            {/* Waiting hint shown when device is ready but peer hasn't called yet */}
            {status === 'Ready' && !onCall && (
                <p className="mt-4 text-slate-400 text-sm text-center">
                    You can start the call, or wait for the other party to call you first.
                </p>
            )}
        </div>
    );
};

export default VoiceCall;
