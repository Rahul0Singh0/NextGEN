import express from "express";
import messageRoute from "./messageRoute.js";
import aiRoute from "./aiRoute.js";

const router = express.Router();

router.use('/message', messageRoute);
router.use("/generate", aiRoute);

export default router;