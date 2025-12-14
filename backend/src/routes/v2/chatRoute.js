import express from 'express';
import { renameChatController, streamChatContent, deleteChatSession, getChatHistory, getChatSessions } from '../../controller/chatController.js';

const router = express.Router();

router.post('/stream', streamChatContent);

router.get('/history/:sessionId', getChatHistory);

router.delete('/:sessionId', deleteChatSession);

router.get('/sessions', getChatSessions);

router.put('/rename/:sessionId', renameChatController);

export default router;