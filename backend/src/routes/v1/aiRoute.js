import express from 'express';
import { generateContent } from '../../controller/aiController.js';

const router = express.Router();

// Define the POST route for content generation
// This matches the endpoint called by your frontend: /api/generate
router.post('/', generateContent);

export default router;