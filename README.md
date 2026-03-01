<p align="center">
  <img src="https://img.shields.io/badge/SwasthAI-Health%20Intelligence-00E5C4?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMEU1QzQiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTEyIDJhOSA5IDAgMCAwLTYuMzYgMTUuMzZMOCAxOWgydjNoNHYtM2gydjBsMi4zNi0xLjY0QTkgOSAwIDAgMCAxMiAyeiIvPjwvc3ZnPg==&logoColor=white" alt="SwasthAI" />
</p>

<h1 align="center">🧠 SwasthAI — Emotion-Aware Health Intelligence Platform</h1>

<p align="center">
  <em>An AI-powered personal health companion that understands your emotions, tracks your wellness, and provides context-intelligent health guidance.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js" />
  <img src="https://img.shields.io/badge/AI-Google%20Gemini-4285F4?style=flat-square&logo=google" />
  <img src="https://img.shields.io/badge/Database-SQLite-003B57?style=flat-square&logo=sqlite" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-38BDF8?style=flat-square&logo=tailwindcss" />
</p>

---

## 🌟 What is SwasthAI?

**SwasthAI** is a next-generation personal health intelligence platform that goes beyond basic health tracking. It combines **emotion-aware AI**, **real-time health analytics**, and **gamification** to create a deeply personalized wellness experience.

Unlike traditional health apps, SwasthAI **understands how you feel** — it detects emotions from your messages, adapts its responses with empathy, and delivers context-intelligent health guidance by aggregating your entire health profile (mood history, symptoms, nutrition, hydration, and more).

---

## ✨ Key Features

### 🤖 Emotion-Aware AI Health Chat
- **Real-time emotion detection** — Detects anxiety, sadness, frustration, hope, and more from user messages
- **Context-intelligent responses** — AI queries include full user health profile (mood logs, symptoms, food diary, water intake)
- **Empathetic communication** — Responses adapt tone based on detected emotional state
- **Markdown-rendered responses** with bold, headers, and bullet formatting
- **Emotion badges** displayed on each AI response (e.g., "Sensing Anxiety", "Positive Vibes")
- **3 conversation modes**: Personal, Community-Aware, and Mental Support
- **Time-aware quick suggestions** that change by time of day

### 📊 AI-Powered Health Analytics Dashboard
- **AI Health Insights** — Automated observations on hydration, sleep, and activity patterns
- **Weekly Mood & Hydration Trends** — Dual-axis area charts tracking emotional and hydration patterns
- **Nutrition Breakdown** — Pie chart visualization of protein, carbs, and fat intake
- **Health Score Trend** — Track overall health trajectory over time
- **Mood Distribution** — 30-day emotional pattern analysis
- **Symptom Category Tracking** — Identify recurring health concerns

### 🧘 Mental Wellbeing Suite
- **AI-Powered Mindful Journal** — Write entries and receive real-time AI sentiment analysis with supportive feedback
- **Mood Tracking** with emoji-based logging and 7-day trend visualization
- **Guided Breathing Exercises** — 4-7-8 breathing technique with animated visual guidance
- **Voice Journal** — Record and reflect on thoughts
- **Self-Care Challenges** — Gamified wellness goals with XP rewards
- **Stress & Heart Rate Monitoring** with interactive sliders

### 🏠 Smart Home Dashboard
- **AI Daily Summary** — Personalized health recap generated each day with highlights and suggestions
- **Health Score Orb** — Animated visualization showing overall health status
- **Weekly Mood Trend Chart** — Real-time mood data visualization
- **BMI Quick Badge** — Instant body mass index display
- **Hydration Tracker** — Quick-log water intake with goal tracking
- **Emergency SOS** — One-tap access to emergency services and mental health helplines

### 🔬 AI Symptom Scanner
- **Natural language symptom input** — Describe symptoms in your own words
- **AI-powered analysis** using Google Gemini with medical knowledge context
- **Risk assessment** with confidence scoring
- **Follow-up recommendations** with actionable next steps

### 🥗 Smart Food Diary
- **Meal logging** with AI-powered nutritional analysis
- **Calorie, protein, carbs, and fat** tracking
- **Health score per meal** — AI evaluates nutritional quality
- **7-day nutrition history** with visual breakdowns

### 🗺️ City Health Intelligence
- **Hyper-local health data** — Zone-wise health risk mapping
- **Community health trends** — Track disease patterns in your area
- **Air quality monitoring** and health alerts
- **Public health alerts** with real-time updates

### 🎮 Gamification & Engagement
- **XP System** — Earn experience points for every health action
- **Level Progression** — Level up as you consistently track health
- **Streak Tracking** — Daily login and activity streaks
- **Badge Collection** — Earn achievement badges for milestones
- **Self-Care Challenges** — Complete daily wellness goals for bonus XP

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite 6 |
| **Styling** | Tailwind CSS 4, Glassmorphism Design System |
| **Animations** | Framer Motion (motion/react) |
| **Charts** | Recharts (Area, Bar, Pie charts) |
| **Backend** | Node.js, Express.js |
| **Database** | SQLite (via sql.js — in-browser compatible) |
| **AI Engine** | Google Gemini 1.5 Flash |
| **Auth** | JWT-based authentication with bcrypt |
| **Routing** | React Router v6 |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **npm** v9+
- A **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/swasthai.git
cd swasthai

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd backend
npm install

# 4. Set up environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### Configuration

Create a `backend/.env` file:
```env
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_jwt_secret_here
PORT=3001
```

### Running the App

```bash
# Terminal 1: Start the backend
cd backend
node server.js
# ✅ Backend runs at http://localhost:3001

# Terminal 2: Start the frontend
npm run dev
# ✅ Frontend runs at http://localhost:5173
```

---

## 📁 Project Structure

```
swasthai/
├── src/                        # Frontend (React + TypeScript)
│   ├── app/
│   │   ├── pages/
│   │   │   ├── app/
│   │   │   │   ├── Home.tsx            # Smart dashboard with AI summary
│   │   │   │   ├── AIChat.tsx          # Emotion-aware health chat
│   │   │   │   ├── HealthAnalytics.tsx # AI-powered analytics dashboard
│   │   │   │   ├── MentalWellbeing.tsx # Mental health suite
│   │   │   │   ├── SymptomScan.tsx     # AI symptom scanner
│   │   │   │   ├── FoodDiary.tsx       # Nutrition tracker
│   │   │   │   ├── CityIntelligence.tsx# Community health map
│   │   │   │   └── Profile.tsx         # User profile & gamification
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Signup.tsx
│   │   ├── components/         # Reusable UI components
│   │   └── routes.tsx          # App routing
│   ├── contexts/               # Auth & Toast contexts
│   └── lib/                    # API client utilities
├── backend/                    # Backend (Node.js + Express)
│   ├── routes/
│   │   ├── auth.js             # Authentication (register/login)
│   │   ├── chat.js             # AI chat with context injection
│   │   ├── health.js           # Health metrics & analytics
│   │   ├── mental.js           # Mental wellbeing & journaling
│   │   ├── profile.js          # User profile management
│   │   └── ...                 # Other routes
│   ├── services/
│   │   └── aiEngine.js         # Gemini AI integration engine
│   ├── db/
│   │   └── database.js         # SQLite schema & helpers
│   └── server.js               # Express server entry point
└── package.json
```

---

## 🧠 How the AI Works

SwasthAI's intelligence layer is built on **three pillars**:

1. **Emotion Detection** — Every user message is analyzed for emotional state (anxious, sad, frustrated, hopeful, curious, distressed). The AI adapts its tone and response strategy accordingly.

2. **Health Context Injection** — Before generating a response, the AI receives the user's complete health profile:
   - Recent mood logs (last 7 days)
   - Symptom history
   - Water intake today
   - Food diary entries
   - Profile data (age, BMI, conditions)

3. **Situational Awareness** — The AI factors in time of day, health trends, and community health data to provide contextually relevant guidance.

```
User Message → Emotion Analysis → Context Aggregation → Gemini AI → Empathetic Response
```

---

## 📸 Screenshots

| Home Dashboard | AI Health Chat |
|:-:|:-:|
| AI Summary, Health Orb, Trends | Emotion Badges, Markdown, Context |

| Health Analytics | Mental Wellbeing |
|:-:|:-:|
| Charts, AI Insights, Stats | Journal, Mood, Breathing |

---

## 🏆 Built For

**AMD Pervasive AI Developer Contest** — Demonstrating how AI can be deeply integrated into personal health management through emotion awareness, contextual intelligence, and real-time analytics.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Made with 💚 by Team SwasthAI
</p>
