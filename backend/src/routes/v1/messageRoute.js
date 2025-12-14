import express from 'express';
import { getMessage } from '../../controller/messageController.js';

const router = express.Router();

// Define the POST route for content generation
// This matches the endpoint called by your frontend: /api/generate
router.get('/', getMessage);

export default router;