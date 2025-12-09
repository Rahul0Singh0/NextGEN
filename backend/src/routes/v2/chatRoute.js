import express from 'express';
import { streamChatContent, deleteChatSession, getChatHistory, getChatSessions } from '../../controller/chatController.js';

const router = express.Router();

// POST: Starts or continues a chat session with streaming output
// Full path will be /api/v1/chat/stream
router.post('/stream', streamChatContent);

// GET: Fetches the entire history for a given session ID
// Full path will be /api/v1/chat/history/:sessionId
router.get('/history/:sessionId', getChatHistory);

// DELETE: Deletes the entire conversation history
// Full path will be /api/v1/chat/:sessionId
router.delete('/:sessionId', deleteChatSession);

router.get('/sessions', getChatSessions);

export default router;