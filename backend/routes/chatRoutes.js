import express from 'express';
import { getContacts, getMessages, getUnreadCount } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/contacts', getContacts);
router.get('/messages/:contactId', getMessages);
router.get('/unread-count', getUnreadCount);

export default router;
