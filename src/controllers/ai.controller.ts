import { Response } from "express";
import axios from "axios";
import { AuthRequest } from "../middleware/auth";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

async function callGroq(messages: { role: string; content: string }[], maxTokens = 600) {
  const response = await axios.post(
    GROQ_URL,
    {
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    }
  );
  return response.data.choices?.[0]?.message?.content ?? "";
}

// POST /api/ai/generate-description
// Feature A: AI Content Generator
// body: { title, category, keywords, length: "short"|"medium"|"long" }
export async function generateDescription(req: AuthRequest, res: Response) {
  const { title, category, keywords = "", length = "medium" } = req.body;
  if (!title || !category) {
    return res.status(400).json({ message: "title and category are required." });
  }

  const lengthGuide: Record<string, string> = {
    short: "around 40-60 words",
    medium: "around 100-150 words",
    long: "around 200-250 words",
  };

  const systemPrompt =
    "You are EventPilot's event copywriter. Write compelling, concrete, non-generic " +
    "event descriptions for a Bangladeshi student/tech community audience. Avoid clichés " +
    "and placeholder-sounding text. Output plain text only, no markdown headers.";

  const userPrompt = `Write an event description for:
Title: ${title}
Category: ${category}
Keywords/context: ${keywords || "none provided"}
Target length: ${lengthGuide[length] || lengthGuide.medium}

Return only the description text.`;

  const content = await callGroq(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    500
  );

  res.json({ description: content.trim() });
}

// POST /api/ai/chat
// Feature C: AI Chat Assistant (context-aware, conversation history)
// body: { messages: [{role, content}], page?: string }
export async function chatAssistant(req: AuthRequest, res: Response) {
  const { messages = [], page = "" } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: "messages array is required." });
  }

  const systemPrompt = `You are the EventPilot AI Assistant, embedded inside the EventPilot event-discovery
platform (events in Dhaka: hackathons, workshops, meetups, conferences). You help users:
- find events matching their interests
- explain how to add/manage events, log in, or filter the events page
- give follow-up suggestions related to their last question
Current page context: ${page || "unknown"}.
Keep answers concise (2-5 sentences) and practical. If you don't know a specific real-time
detail (like exact seat count), say so honestly instead of inventing it.`;

  const content = await callGroq(
    [{ role: "system", content: systemPrompt }, ...messages],
    500
  );

  // Simple heuristic follow-up suggestions (kept deterministic, not another AI call,
  // to keep this fast/cheap -- could be swapped for a model call later).
  const suggestions = [
    "Show me upcoming hackathons",
    "How do I add my own event?",
    "What's the cheapest workshop this month?",
  ];

  res.json({ reply: content.trim(), suggestions });
}
