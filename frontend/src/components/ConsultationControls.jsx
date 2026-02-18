import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Clock } from 'lucide-react';

const ConsultationControls = ({
    type, // 'voice' or 'video'
    onEndCall,
    isMuted,
    onToggleMute,
    callDuration
}) => {
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center justify-center space-x-6 p-6 bg-white rounded-2xl shadow-lg border border-indigo-50">
            <div className="flex items-center space-x-2 text-indigo-600 font-mono text-xl">
                <Clock className="w-5 h-5 animate-pulse" />
                <span>{formatDuration(callDuration)}</span>
            </div>

            <button
                onClick={onToggleMute}
                className={`p-4 rounded-full transition-all duration-300 ${isMuted
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                    }`}
                title={isMuted ? 'Unmute' : 'Mute'}
            >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            <button
                onClick={onEndCall}
                className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-300 shadow-lg shadow-red-200"
                title="End Consultation"
            >
                <PhoneOff className="w-6 h-6" />
            </button>

            {type === 'video' && (
                <button
                    className="p-4 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-all duration-300"
                    title="Camera Controls"
                >
                    <Video className="w-6 h-6" />
                </button>
            )}
        </div>
    );
};

export default ConsultationControls;
