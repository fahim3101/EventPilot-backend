import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import User from "../models/User";
import Event from "../models/Event";
import Review from "../models/Review";

dotenv.config();

async function seed() {
  await connectDB(process.env.MONGODB_URI as string);

  let organizer = await User.findOne({ email: "demo@eventpilot.ai" });
  if (!organizer) {
    organizer = await User.create({
      name: "Demo User",
      email: "demo@eventpilot.ai",
      password: "DemoPass123!",
      provider: "local",
    });
  }

  await Event.deleteMany({});
  await Review.deleteMany({});

  const events = await Event.insertMany([
    {
      title: "Dhaka University Hackathon 2026",
      shortDescription: "48-hour build sprint for undergrad teams, sponsored by local fintech startups.",
      fullDescription:
        "A 48-hour hackathon open to all Dhaka University CS/EEE undergrads. Teams of up to 4 build a working prototype around this year's theme: 'Fintech for the underbanked.' Mentors from bKash, Bijoy Prokashon and Brain Station 23 will be on-site for check-ins. Prizes include internship interviews and BDT 100,000 cash for the top team.",
      category: "Hackathon",
      date: new Date("2026-09-12"),
      location: "TSC, Dhaka University",
      price: 0,
      capacity: 200,
      imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
      images: [
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800",
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
      ],
      tags: ["hackathon", "fintech", "students"],
      organizer: organizer._id,
      attendeesCount: 134,
    },
    {
      title: "Next.js 15 Deep Dive Workshop",
      shortDescription: "Hands-on workshop covering App Router, Server Actions, and caching internals.",
      fullDescription:
        "A 3-hour hands-on workshop for frontend developers who already know React basics. We'll cover the App Router mental model, Server Components vs Client Components, Server Actions, and the new caching semantics in Next.js 15. Bring a laptop -- we'll build a small full-stack app live.",
      category: "Workshop",
      date: new Date("2026-08-02"),
      location: "Brain Station 23, Banani, Dhaka",
      price: 500,
      capacity: 60,
      imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800",
      images: [
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800",
        "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800",
      ],
      tags: ["nextjs", "frontend", "workshop"],
      organizer: organizer._id,
      attendeesCount: 41,
    },
    {
      title: "Dhaka Frontend Developers Meetup #14",
      shortDescription: "Monthly meetup: talks on design systems, performance, and a Q&A with hiring managers.",
      fullDescription:
        "Our 14th monthly meetup brings together frontend developers across Dhaka. This month: a talk on building design systems at scale, a lightning talk on Core Web Vitals, and an open Q&A panel with hiring managers from 3 local startups looking for frontend interns.",
      category: "Meetup",
      date: new Date("2026-08-15"),
      location: "Bantayan Coworking, Gulshan, Dhaka",
      price: 0,
      capacity: 80,
      imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800",
      tags: ["meetup", "frontend", "networking"],
      organizer: organizer._id,
      attendeesCount: 57,
    },
    {
      title: "AI in Bangladesh Conference 2026",
      shortDescription: "A day of keynotes and panels on applied AI, agentic systems, and local AI startups.",
      fullDescription:
        "A full-day conference bringing together AI practitioners, researchers, and founders from Bangladesh's growing AI ecosystem. Keynotes on agentic AI systems, panels on responsible AI adoption in local industry, and a startup showcase featuring 10 early-stage AI companies.",
      category: "Conference",
      date: new Date("2026-10-05"),
      location: "Pan Pacific Sonargaon, Dhaka",
      price: 1500,
      capacity: 400,
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
      tags: ["ai", "conference", "networking"],
      organizer: organizer._id,
      attendeesCount: 212,
    },
    {
      title: "Resume & LinkedIn Clinic for CS Students",
      shortDescription: "Free 1-on-1 resume review sessions with engineers from local tech companies.",
      fullDescription:
        "Bring your resume (printed or digital) for a free 15-minute 1-on-1 review with a working software engineer. We'll also cover how to structure a project section, and how to write a LinkedIn headline that gets recruiter attention. Slots are first-come, first-served.",
      category: "Career Fair",
      date: new Date("2026-08-22"),
      location: "BUET Central Auditorium",
      price: 0,
      capacity: 120,
      imageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800",
      tags: ["career", "resume", "students"],
      organizer: organizer._id,
      attendeesCount: 98,
    },
    {
      title: "Intro to Prompt Engineering Webinar",
      shortDescription: "Live online webinar on writing effective prompts for production LLM applications.",
      fullDescription:
        "A live, online 90-minute webinar covering prompt engineering fundamentals: few-shot examples, chain-of-thought techniques, structured outputs, and common failure modes when building LLM features into real products. Recording will be shared with all registrants.",
      category: "Webinar",
      date: new Date("2026-08-08"),
      location: "Online (Zoom link sent after registration)",
      price: 0,
      capacity: 500,
      imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800",
      tags: ["ai", "webinar", "online"],
      organizer: organizer._id,
      attendeesCount: 301,
    },
    {
      title: "Pohela Boishakh Tech Mela",
      shortDescription: "Cultural + tech showcase celebrating Bangla New Year with student project exhibits.",
      fullDescription:
        "A cultural festival with a tech twist -- student project exhibitions, live coding battles, traditional food stalls, and music, all in celebration of Pohela Boishakh. A great low-pressure event to showcase your side projects to a friendly crowd.",
      category: "Cultural",
      date: new Date("2026-04-14"),
      location: "Suhrawardy Udyan, Dhaka",
      price: 0,
      capacity: 1000,
      imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
      tags: ["cultural", "festival", "student-projects"],
      organizer: organizer._id,
      attendeesCount: 540,
    },
    {
      title: "MERN Stack Bootcamp: Deployment Day",
      shortDescription: "Full-day workshop on deploying MERN apps to Vercel + Atlas without the common pitfalls.",
      fullDescription:
        "A practical, full-day workshop focused entirely on deployment: environment variables, MongoDB Atlas network access rules, fixing SRV DNS connection issues, Vercel serverless function cold-starts, and setting up CI so your MERN app doesn't break in production.",
      category: "Workshop",
      date: new Date("2026-09-01"),
      location: "Independent University Bangladesh (IUB)",
      price: 800,
      capacity: 50,
      imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
      tags: ["mern", "deployment", "workshop"],
      organizer: organizer._id,
      attendeesCount: 33,
    },
  ]);

  await Review.insertMany([
    { event: events[0]._id, user: organizer._id, rating: 5, comment: "Incredibly well organized, mentors were super helpful." },
    { event: events[1]._id, user: organizer._id, rating: 4, comment: "Great pace, wish it was a bit longer." },
  ]);

  console.log(`✅ Seeded ${events.length} events.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
