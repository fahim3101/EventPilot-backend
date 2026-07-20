import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  date: Date;
  location: string;
  price: number;
  capacity: number;
  imageUrl: string;
  images: string[];
  tags: string[];
  organizer: mongoose.Types.ObjectId;
  attendeesCount: number;
  createdAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true, maxlength: 200 },
    fullDescription: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["Hackathon", "Workshop", "Meetup", "Conference", "Webinar", "Career Fair", "Cultural"],
    },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true, default: 0, min: 0 },
    capacity: { type: Number, required: true, default: 50, min: 1 },
    imageUrl: { type: String, required: true },
    images: [{ type: String }],
    tags: [{ type: String }],
    organizer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    attendeesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

EventSchema.index({ title: "text", shortDescription: "text", tags: "text" });

export default mongoose.model<IEvent>("Event", EventSchema);
