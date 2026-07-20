import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { register, login, demoLogin, googleLogin, me, logout } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/demo-login", asyncHandler(demoLogin));
router.post("/google", asyncHandler(googleLogin));
router.get("/me", requireAuth, asyncHandler(me));
router.post("/logout", logout);

export default router;
