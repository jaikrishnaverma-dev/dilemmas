# ⚖️ Dilemmas (Verdict)

**Your side deserves to be heard. India judges it.**

Dilemmas is a high-engagement, anonymous life-dilemma judgment platform built for the Indian community. Users submit real situations from their lives—friendship conflicts, family pressure, relationship drama—and the community picks a side, providing one-line reasoning.

---

## 🌍 Multilingual by Design
The platform is built to speak your language. Switch seamlessly between:
- **English**: Standard professional experience.
- **Hinglish**: Conversational, Gen-Z friendly mix of Hindi and English.
- **Hindi (हिंदी)**: Native Hindi experience.
- **Telugu (తెలుగు)**: Native Telugu experience.

All text labels, filters, categories, and validation messages are dynamically localized.

---

## 🚀 Key Modules

### 📝 Case Submission
An anonymous 3-step form where users share their stories.
- **The Hook:** Compelling titles and context.
- **Rich Text:** Support for formatting and tagging users in stories.
- **Expiry:** Cases automatically expire in 48 hours to maintain urgency.

### 🧵 Verdict Feed
An infinite scroll of live cases.
- **Real-time Counters:** Ticking votes and time-remaining badges.
- **Hot Cases:** Trending cases with high vote velocity.
- **Dynamic Filters:** Filter by city, category, or language preference.

### 🗳️ Verdict Engine
The core interaction loop.
- **3-Side Voting:** "Teri galti" (Your fault), "Uski galti" (Their fault), or "Situation hi galat" (The situation was wrong).
- **Forced Reasoning:** Users must provide a one-line reason before their vote is registered.
- **Results Breakdown:** City-wise breakdowns revealed immediately after voting.

### 🏆 Judge Score & Identity
Build your reputation as a fair judge.
- **Judge Score:** Earn points when submitters rate your verdict as "fair."
- **Badges:** Unlock unique identities like *Nyayadhish* (Balanced), *Street Smart* (Practical), *Dil Se* (Emotional), or *Devil's Advocate* (Contrarian).
- **Leaderboards:** City-wise leaderboards for status.

### 📤 Share Engine
- **Share Cards:** Auto-generated cards showing your verdict + the % of India that agreed with you.
- **Recruit Loop:** Shared links bring new users directly into the voting flow.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16.2+](https://nextjs.org/) (App Router, Turbopack)
- **Styling:** Custom CSS with Premium Aesthetics (Glassmorphism, Vibrant Gradients)
- **Database:** [MongoDB](https://www.mongodb.com/)
- **Authentication:** JWT (JSON Web Tokens) with AuthContext provider
- **Icons:** [Lucide React](https://lucide.dev/)
- **Editor:** [TipTap](https://tiptap.dev/) for rich text submission

---

## 🚦 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   Create a `.env.local` file with:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the platform.

---

## 🛡️ Rate Limits

All write-sensitive endpoints are rate-limited to protect the platform from abuse, spam, and brute-force attacks. Limits are tracked **per user** (if logged in) or **per IP address** (if anonymous).

| Endpoint | Limit | Window | What Happens When Exceeded |
| :--- | :---: | :---: | :--- |
| **Signup** (`POST /api/auth/signup`) | 10 | 1 hour | "Ek ghante mein sirf 10 baar signup kar sakte ho. Thodi der baad try karo! ⏳" |
| **Login** (`POST /api/auth/login`) | 20 | 1 hour | "Bohot zyada login attempts! Ek ghante mein sirf 20 baar try kar sakte ho. Thodi der baad aao 🔐" |
| **Forgot Password** (`POST /api/auth/forgot-password`) | 6 | 1 hour | "Password reset ke liye ek ghante mein sirf 6 baar request kar sakte ho. Apna email inbox check karo! 📧" |
| **Submit Case** (`POST /api/cases`) | 10 | 1 hour | "Ek ghante mein sirf 10 cases submit kar sakte ho. Quality over quantity! ✍️" |
| **Cast Verdict** (`POST /api/verdicts`) | 60 | 1 hour | "Ek ghante mein sirf 60 verdicts de sakte ho. Thodi der baad aur cases judge karo! ⚖️" |

**Technical Details:**
- Rate limits are stored in MongoDB with a TTL (time-to-live) index, so expired records are automatically cleaned up.
- The middleware (`src/lib/middleware/withRateLimit.js`) wraps any route handler as a higher-order function (HOF).
- HTTP status code `429 Too Many Requests` is returned when the limit is exceeded.
- All public GET routes (feed, search, leaderboard) are **not** rate-limited to allow unrestricted browsing.

---

## 📂 Project Structure

- `src/app`: Next.js App Router pages and API routes.
- `src/modules`: Core feature modules (Auth, Feed, Profile).
- `src/shared`: 
    - `locales`: Unicode-safe translation files (`en`, `hi`, `te`, `hinglish`).
    - `components`: Reusable UI elements (BottomNav, TopBar, VerdictSplitBar).
    - `utils`: i18n helpers, time formatting, api client, text processing.
- `src/lib`:
    - `models`: Mongoose schemas (User, Case, Verdict, JudgeScore, RateLimit, Notification).
    - `middleware`: Server-side HOFs (`withAuth`, `withRateLimit`).
    - `jwt.js`, `mongodb.js`, `apiResponse.js`: Core utilities.

---

Built with ❤️ for the Indian community.
