import mongoose from 'mongoose';

const authLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    email: {
        type: String,
        required: true
    },
    eventType: {
        type: String,
        enum: ['signup', 'login'],
        required: true
    }
}, {
    timestamps: true
});

const AuthLog = mongoose.model('AuthLog', authLogSchema);
export default AuthLog;
