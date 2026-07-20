# EventPilot AI — Backend

Express + TypeScript REST API powering [EventPilot AI](https://event-pilot-frontend.vercel.app).

[![Express](https://img.shields.io/badge/Express-4.x-000?logo=express)](https://expressjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-000?logo=mongodb)](https://mongoosejs.com)
[![Node](https://img.shields.io/badge/Node-%E2%89%A518-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Live](https://img.shields.io/badge/Live-Render-46E3B7?logo=render)](https://eventpilot-backend-zqn8.onrender.com/api/health)

**Base URL (prod):** `https://eventpilot-backend-zqn8.onrender.com/api`
**Health check:** [`GET /health`](https://eventpilot-backend-zqn8.onrender.com/api/health) → `{"status":"ok"}`

---

## ✨ What this service does

- **Auth**: JWT-in-httpOnly-cookie sessions, email/password + bcrypt, Google ID-token verification, one-click demo login
- **Events**: CRUD with ownership checks, search / filter / sort / paginate, category aggregations, reviews
- **AI**: Two Groq-powered endpoints (description generator + multi-turn chat assistant)
- **Resilience**: MongoDB retry on connect, explicit DNS-SRV failure guidance, `asyncHandler` wrapper on every async route to prevent unhandled-rejection crashes

---

## 🧱 Tech stack

| Layer | Choice |
| --- | --- |
| Runtime | Node.js ≥ 18 |
| Framework | Express 4 |
| Language | TypeScript 5.6 |
| Database | MongoDB via Mongoose 8 |
| Auth | `jsonwebtoken` + `bcryptjs` + `google-auth-library` |
| Validation | `express-validator` |
| Security | `helmet` + `cors` (multi-origin, slash-tolerant) |
| Logging | `morgan` (dev) |
| AI | Groq Cloud (`llama-3.3-70b-versatile`) |
| Dev | `ts-node-dev` (hot reload) |

---

## 📁 Project layout

```
backend/
├── src/
│   ├── config/
│   │   └── db.ts                 # connectDB w/ retry + SRV fallback hint
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── event.controller.ts
│   │   └── ai.controller.ts
│   ├── middleware/
│   │   ├── asyncHandler.ts       # wraps async route handlers
│   │   ├── requireAuth.ts        # JWT verification
│   │   └── errorHandler.ts
│   ├── models/
│   │   ├── User.ts
│   │   └── Event.ts
│   ├── routes/
│   │   ├── auth.routes.ts        # /api/auth
│   │   ├── event.routes.ts       # /api/events
│   │   └── ai.routes.ts          # /api/ai
│   ├── utils/
│   │   ├── seed.ts               # 8 sample events
│   │   └── jwt.ts
│   └── index.ts                  # bootstrap, middleware, route mounting
├── .env.example
├── tsconfig.json
└── package.json
```

---

## 🚀 Local development

### 1. Install
```bash
cd backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```

Edit `.env`:
```ini
PORT=5000
NODE_ENV=development

# MongoDB (use the NON-SRV string if your ISP blocks DNS SRV)
MONGODB_URI=mongodb://user:pass@host1:27017,host2:27017,host3:27017/dbname?ssl=true&replicaSet=...

# Auth
JWT_SECRET=<32+ random chars, e.g. `openssl rand -hex 32`>
JWT_EXPIRES_IN=7d

# Google OAuth (optional)
GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxx.apps.googleusercontent.com

# Groq (free key at https://console.groq.com/keys)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx
GROQ_MODEL=llama-3.3-70b-versatile

# CORS — comma-separated, no trailing slashes
CLIENT_URL=http://localhost:3000
```

### 3. (Optional) Seed sample data
```bash
npm run seed
```

### 4. Run
```bash
npm run dev          # ts-node-dev, hot reload
```

Server starts on `http://localhost:5000`.

---

## 📡 API reference

All routes are prefixed with `/api`. Authenticated routes require a valid JWT cookie (or `Authorization: Bearer <token>` header).

### Auth
| Method | Path | Body | Auth |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | `{ name, email, password }` | ❌ |
| `POST` | `/auth/login` | `{ email, password }` | ❌ |
| `POST` | `/auth/login/demo` | — | ❌ |
| `POST` | `/auth/google` | `{ credential }` (Google ID token) | ❌ |
| `POST` | `/auth/logout` | — | ✅ |
| `GET`  | `/auth/me` | — | ✅ |

### Events
| Method | Path | Query / Body | Auth |
| --- | --- | --- | --- |
| `GET`    | `/events` | `search`, `category`, `maxPrice`, `sort`, `page`, `limit` | ❌ |
| `GET`    | `/events/:id` | — | ❌ |
| `POST`   | `/events` | event payload | ✅ |
| `PUT`    | `/events/:id` | event payload (partial) | ✅ (owner) |
| `DELETE` | `/events/:id` | — | ✅ (owner) |
| `GET`    | `/events/stats/categories` | — | ❌ |
| `POST`   | `/events/:id/reviews` | `{ rating, comment }` | ✅ |
| `DELETE` | `/events/:id/reviews/:reviewId` | — | ✅ (owner) |

### AI
| Method | Path | Body | Auth |
| --- | --- | --- | --- |
| `POST` | `/ai/generate-description` | `{ title, category, keywords }` | ✅ |
| `POST` | `/ai/chat` | `{ message, history? }` | ✅ |

---

## 🛡️ Security notes

- **CORS** accepts a comma-separated `CLIENT_URL` list; trailing slashes are auto-stripped. This avoids the `"https://app.com/" ≠ "https://app.com"` mismatch that breaks many MERN stacks.
- **Helmet** sets sensible default security headers. If you front the API with a custom domain on Vercel/Cloudflare, you may want to tighten `Content-Security-Policy`.
- **Password storage** uses `bcryptjs` with 10 salt rounds.
- **Google Sign-In** verifies the ID token server-side via `google-auth-library` — never trust client-side verification alone.

---

## 🐛 Troubleshooting

### `querySrv ENOTFOUND _mongodb._tcp.cluster0.xxxxx.mongodb.net`
Your ISP/router is blocking DNS SRV lookups (common in some regions).
**Fix:** In MongoDB Atlas, go to **Connect → Drivers → "Standard connection string"** and use the non-SRV URL (e.g. `mongodb://host1:27017,host2:27017,host3:27017/db?ssl=true&replicaSet=...`). The `connectDB` helper will auto-detect this and print a helpful hint.

### CORS error in the browser
Check:
1. `CLIENT_URL` in your backend's env (Render dashboard, not just `.env`) includes the **exact** origin your frontend is served from — no trailing slash.
2. The browser is sending `Cookie` + `Authorization` correctly. With `withCredentials: true` on axios, the `Access-Control-Allow-Credentials: true` header must be present (it is — see `cors` config in `src/index.ts`).

### `401 Unauthorized` on `/api/auth/me`
Expected behavior when not logged in. Frontend treats this as "anonymous user" and shows the public UI. After login, the cookie is set and the call returns 200.

---

## ☁️ Deployment (Render)

1. New **Web Service** from this repo, root = `backend/`
2. Build: `npm install && npm run build`
3. Start: `npm start`
4. Add all env vars from `.env.example` in the **Environment** tab
5. After deploy, update `CLIENT_URL` to include the deployed frontend URL, then redeploy

---

## 📜 License

MIT — see [LICENSE](../LICENSE) in the repo root.
