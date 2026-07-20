import { Response } from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function signToken(id: string) {
  const secret: jwt.Secret = process.env.JWT_SECRET as string;
  const options: jwt.SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"],
  };
  return jwt.sign({ id }, secret, options);
}

function sendAuthResponse(res: Response, user: any) {
  const token = signToken(user._id.toString());
  res
    .cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({
      token,
      user: { id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
    });
}

export async function register(req: AuthRequest, res: Response) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required." });
  }
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }
  const user = await User.create({ name, email, password, provider: "local" });
  sendAuthResponse(res, user);
}

export async function login(req: AuthRequest, res: Response) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }
  sendAuthResponse(res, user);
}

// Demo login: fixed demo account, auto-created if missing, so the
// "Demo Login" button on the frontend always works out of the box.
export async function demoLogin(_req: AuthRequest, res: Response) {
  const demoEmail = "demo@eventpilot.ai";
  let user = await User.findOne({ email: demoEmail });
  if (!user) {
    user = await User.create({
      name: "Demo User",
      email: demoEmail,
      password: "DemoPass123!",
      provider: "local",
    });
  }
  sendAuthResponse(res, user);
}

export async function googleLogin(req: AuthRequest, res: Response) {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ message: "Missing Google credential." });

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) return res.status(400).json({ message: "Invalid Google token." });

  let user = await User.findOne({ email: payload.email });
  if (!user) {
    user = await User.create({
      name: payload.name || "Google User",
      email: payload.email,
      avatarUrl: payload.picture || "",
      provider: "google",
    });
  }
  sendAuthResponse(res, user);
}

export async function me(req: AuthRequest, res: Response) {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found." });
  res.json({ user: { id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl } });
}

export function logout(_req: AuthRequest, res: Response) {
  res.clearCookie("token").json({ message: "Logged out." });
}
