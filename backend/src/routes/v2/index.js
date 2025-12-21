import express from "express";
import chatRoute from "./chatRoute.js";
import authRoute from "./authRoute.js";

const router = express.Router();

router.use("/chat", chatRoute);
router.use("/auth", authRoute);

export default router;