import express from "express";
import chatRoute from "./chatRoute.js";

const router = express.Router();

router.use("/chat", chatRoute);

export default router;