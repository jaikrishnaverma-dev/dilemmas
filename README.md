# ⚖️ Dilemmas (Verdict)

**Your side deserves to be heard. India judges it.**

Dilemmas is an anonymous life-dilemma judgment platform built for Indian Gen Z. Users submit real situations from their lives—friendship conflicts, family pressure, relationship drama—and the community picks a side, providing one-line reasoning. Every interaction is designed around psychological triggers: catharsis, validation, and identity formation.

---

## 🚀 Key Modules

### 📝 Case Submission
An anonymous 3-step form where users share their stories.
- **The Hook:** Compelling titles and context.
- **Moderation:** Cases are reviewed before going live.
- **Expiry:** Cases automatically expire in 48 hours to maintain urgency.

### 🧵 Verdict Feed
An infinite scroll of live cases.
- **Real-time Counters:** Ticking votes and time-remaining badges.
- **Hot Cases:** Trending cases with high vote velocity float to the top.
- **Filters:** Filter by city, category, or trending status.

### 🗳️ Verdict Engine
The core interaction loop.
- **3-Side Voting:** "Teri galti" (Your fault), "Uski galti" (Their fault), or "Situation hi galat" (The situation was wrong).
- **Forced Reasoning:** Users must provide a one-line reason before their vote is registered, ensuring meaningful engagement.
- **Instant Splits:** City and gender-wise breakdowns are revealed immediately after voting.

### 🏆 Judge Score & Identity
Build your reputation as a fair judge.
- **Judge Score:** Earn points when submitters rate your verdict as "fair."
- **Badges:** Unlock unique identities like *Nyayadhish* (Balanced), *Street Smart* (Practical), *Dil Se* (Emotional), or *Devil's Advocate* (Contrarian).
- **Leaderboards:** Compete on city-wise leaderboards for status.

### 📤 Share Engine
Sharing is about identity, not just content.
- **Share Cards:** Auto-generated cards showing your verdict + the % of India that agreed with you.
- **Social Currency:** "Maine kaha teri galti — 64% India mere saath hai."
- **Recruit Loop:** Shared links bring new users directly into the voting flow.

---

## 🧠 UX Principles

- **No Login Wall:** Browse and vote instantly. Account creation is only needed for tracking your Judge Score.
- **Hinglish UI:** The platform speaks like a friend, using conversational Hinglish (*"Verdict do"*, *"Bhai sahi bola"*).
- **City War Rooms:** Activates regional pride by showing how different cities (e.g., Delhi vs Lucknow) judged the same case.
- **Loss Aversion:** 48-hour case expiry creates a "miss it and it's gone" FOMO effect.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router), Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **Styling:** Custom CSS & Premium UI components

---

## 🚦 Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📂 Project Structure

- `src/app`: Next.js App Router pages and API routes.
- `src/modules`: Core feature modules (Auth, Feed, etc.).
- `src/shared`: Reusable components, hooks, and utilities.
- `src/lib`: Database models and server-side logic.
- `database`: Seed scripts and database configurations.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ for the Indian Gen Z community.
