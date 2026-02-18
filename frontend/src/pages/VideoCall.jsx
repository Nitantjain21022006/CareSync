import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JitsiMeeting } from '@jitsi/react-sdk';
import api from '../config/api';
import { AlertCircle, Loader2 } from 'lucide-react';

const VideoCall = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRoomDetails();
    }, []);

    const fetchRoomDetails = async () => {
        try {
            const response = await api.post('/consultation/video/room', { appointmentId });
            setConfig(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to join video room');
            setLoading(false);
        }
    };

    const handleReadyToClose = () => {
        // Redirect to summary on close
        navigate(`/consultation/summary/${appointmentId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-indigo-400" />
                    <p className="text-xl font-medium">Preparing secure video room...</p>
                </div>
            </div>
        );
    }

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
        <div className="h-screen w-screen bg-slate-900 overflow-hidden">
            <JitsiMeeting
                domain="meet.jit.si"
                roomName={config.roomName}
                configOverwrite={{
                    startWithAudioMuted: true,
                    disableModeratorIndicator: true,
                    startScreenSharing: true,
                    enableEmailInStats: false
                }}
                interfaceConfigOverwrite={{
                    DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                    TOOLBAR_BUTTONS: [
                        'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                        'fodeviceselection', 'hangup', 'profile', 'info', 'chat', 'recording',
                        'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                        'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                        'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                        'security'
                    ],
                }}
                userInfo={{
                    displayName: config.doctorName || 'Doctor'
                }}
                onReadyToClose={handleReadyToClose}
                getIFrameRef={(iframeRef) => { iframeRef.style.height = '100%'; }}
            />
        </div>
    );
};

export default VideoCall;
