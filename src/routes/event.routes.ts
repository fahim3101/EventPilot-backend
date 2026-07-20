import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import {
  getEvents,
  getEventById,
  createEvent,
  getMyEvents,
  deleteEvent,
  addReview,
  getCategoryStats,
} from "../controllers/event.controller";

const router = Router();

router.get("/", asyncHandler(getEvents));
router.get("/mine", requireAuth, asyncHandler(getMyEvents)); // must come before /:id
router.get("/stats/categories", asyncHandler(getCategoryStats)); // must come before /:id
router.get("/:id", asyncHandler(getEventById));
router.post("/", requireAuth, asyncHandler(createEvent));
router.delete("/:id", requireAuth, asyncHandler(deleteEvent));
router.post("/:id/reviews", requireAuth, asyncHandler(addReview));

export default router;
