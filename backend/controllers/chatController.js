import Message from '../models/Message.js';
import DoctorPatient from '../models/DoctorPatient.js';
import User from '../models/User.js';

/**
 * GET /api/chat/contacts
 * Returns the list of contacts the logged-in user can chat with.
 * - If patient  → their authorized doctors
 * - If doctor   → their authorized patients
 */
export const getContacts = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;

        let contacts = [];

        if (role === 'patient') {
            const links = await DoctorPatient.find({ patient: userId, status: 'active' }).populate(
                'doctor',
                'fullName email profilePhoto metadata'
            );
            contacts = links.map((l) => l.doctor);
        } else if (role === 'doctor') {
            const links = await DoctorPatient.find({ doctor: userId, status: 'active' }).populate(
                'patient',
                'fullName email profilePhoto metadata'
            );
            contacts = links.map((l) => l.patient);
        }

        res.json({ success: true, data: contacts });
    } catch (err) {
        console.error('getContacts error:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

/**
 * GET /api/chat/messages/:contactId
 * Returns paginated message history between the logged-in user and contactId.
 * Also marks all un-read messages (sent by contactId to me) as read.
 */
export const getMessages = async (req, res) => {
    try {
        const myId = req.user._id;
        const { contactId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // Mark incoming messages as read
        await Message.updateMany(
            { sender: contactId, receiver: myId, read: false },
            { read: true }
        );

        const messages = await Message.find({
            $or: [
                { sender: myId, receiver: contactId },
                { sender: contactId, receiver: myId },
            ],
        })
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit)
            .lean();

        res.json({ success: true, data: messages });
    } catch (err) {
        console.error('getMessages error:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

/**
 * GET /api/chat/unread-count
 * Returns total unread message count for the logged-in user.
 */
export const getUnreadCount = async (req, res) => {
    try {
        const myId = req.user._id;
        const count = await Message.countDocuments({ receiver: myId, read: false });
        res.json({ success: true, count });
    } catch (err) {
        console.error('getUnreadCount error:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
