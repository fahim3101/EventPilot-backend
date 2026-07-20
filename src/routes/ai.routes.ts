import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { generateDescription, chatAssistant } from "../controllers/ai.controller";

const router = Router();

router.post("/generate-description", requireAuth, asyncHandler(generateDescription));
router.post("/chat", asyncHandler(chatAssistant)); // public: assistant works for logged-out visitors too

export default router;
