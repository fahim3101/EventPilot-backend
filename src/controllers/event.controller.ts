import { Response } from "express";
import Event from "../models/Event";
import Review from "../models/Review";
import { AuthRequest } from "../middleware/auth";

// GET /api/events?search=&category=&minPrice=&maxPrice=&sort=&page=&limit=
export async function getEvents(req: AuthRequest, res: Response) {
  const { search, category, minPrice, maxPrice, sort = "date", page = "1", limit = "8" } = req.query as Record<string, string>;

  const filter: any = {};
  if (search) filter.$text = { $search: search };
  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const sortMap: Record<string, any> = {
    date: { date: 1 },
    "-date": { date: -1 },
    price: { price: 1 },
    "-price": { price: -1 },
    newest: { createdAt: -1 },
  };

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(24, Math.max(1, parseInt(limit)));

  const [events, total] = await Promise.all([
    Event.find(filter)
      .sort(sortMap[sort] || sortMap.date)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate("organizer", "name avatarUrl"),
    Event.countDocuments(filter),
  ]);

  res.json({
    events,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
}

export async function getEventById(req: AuthRequest, res: Response) {
  const event = await Event.findById(req.params.id).populate("organizer", "name avatarUrl email");
  if (!event) return res.status(404).json({ message: "Event not found." });

  const [reviews, related] = await Promise.all([
    Review.find({ event: event._id }).populate("user", "name avatarUrl").sort({ createdAt: -1 }),
    Event.find({ category: event.category, _id: { $ne: event._id } }).limit(4),
  ]);

  res.json({ event, reviews, related });
}

export async function createEvent(req: AuthRequest, res: Response) {
  const event = await Event.create({ ...req.body, organizer: req.userId });
  res.status(201).json({ event });
}

export async function getMyEvents(req: AuthRequest, res: Response) {
  const events = await Event.find({ organizer: req.userId }).sort({ createdAt: -1 });
  res.json({ events });
}

export async function deleteEvent(req: AuthRequest, res: Response) {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found." });
  if (event.organizer.toString() !== req.userId) {
    return res.status(403).json({ message: "You can only delete events you created." });
  }
  await event.deleteOne();
  res.json({ message: "Event deleted." });
}

// GET /api/events/stats/categories
// Powers the "Events by Category" Recharts bar chart on the landing page.
export async function getCategoryStats(_req: AuthRequest, res: Response) {
  const stats = await Event.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $project: { _id: 0, category: "$_id", count: 1 } },
    { $sort: { count: -1 } },
  ]);
  res.json({ stats });
}

export async function addReview(req: AuthRequest, res: Response) {
  const { rating, comment } = req.body;
  const review = await Review.create({ event: req.params.id, user: req.userId, rating, comment });
  res.status(201).json({ review });
}
