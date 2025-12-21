import express from 'express';
import { 
    renameChatController, 
    streamChatContent, 
    deleteChatSession, 
    getChatHistory, 
    getChatSessions 
} from '../../controller/chatController.js';

import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post('/stream', protect, streamChatContent);

router.get('/history/:sessionId', protect, getChatHistory);

router.delete('/:sessionId', protect, deleteChatSession);

router.get('/sessions', protect, getChatSessions);

router.put('/rename/:sessionId', protect, renameChatController);

export default router;