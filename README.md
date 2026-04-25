# ♻️ PUNARNAVA — AI-Powered E-Waste Intelligence Platform

> **"Scan it. Know it. Recycle it."**
>
> PUNARNAVA bridges the gap between consumers and certified e-waste recyclers using real-time AI vision, live scrap market data, and a gamified reward system — turning electronic waste into measurable environmental impact.

---

## 🎯 Problem Statement

**50 million tonnes** of e-waste is generated globally each year. Most consumers don't know:

- What their old devices are worth in raw materials
- Which components are hazardous vs. recoverable
- Where to find certified recyclers nearby

**PUNARNAVA solves this** by putting an AI-powered material analyst in everyone's pocket.

---

## ✨ Key Features

### 🔬 AI Vision Scanner (Gemini 1.5 Flash)

- **Real-time device identification** — point your camera at any electronic device
- **Material decomposition** — exact breakdown of Gold, Copper, Lithium, PCB, Aluminium with gram-level precision
- **Live scrap valuation** — real-time INR pricing fetched from metal commodity APIs
- **Hazard classification** — Safe / Moderate / Hazardous safety ratings
- **Disassembly guides** — step-by-step teardown instructions for safe recycling
- **YouTube integration** — auto-fetches relevant disassembly video tutorials

### 👤 User Dashboard

- **Eco Impact Tracker** — CO2 saved, devices recycled, total recovery value
- **Gamified Points System** — earn points for every scan and recycling submission
- **Badge Progression** — Eco Starter → Eco Warrior → Green Guardian → Circuit Sage → Urban Miner → Eco Legend
- **Global Leaderboard** — compete with other users on environmental impact
- **Recycler Matching** — AI-powered matching with nearest certified recyclers

### 🏭 Recycler Portal

- **Live Scrap Market** — real-time commodity pricing dashboard
- **Device Intake System** — process incoming e-waste with AI classification
- **Business Analytics** — revenue tracking, material recovery rates, throughput metrics
- **Subscription Plans** — tiered access (Starter → Professional → Enterprise Matrix)
- **Recycler Profile** — business dashboard with certifications and processing history

### 🔐 Authentication and Security

- **Google OAuth** — one-click sign-in with smart mobile redirect
- **Email/Password** — traditional auth with password reset
- **Role-Based Access** — hard split between User and Recycler interfaces
- **Firebase Firestore** — real-time data sync with optimistic UI updates

---

## 🏗️ Architecture

```
PUNARNAVA PLATFORM
├── USER APP
│   ├── AI Scanner (Gemini Vision)
│   ├── My Impact Dashboard
│   ├── Global Leaderboard
│   └── User Profile
│
├── RECYCLER APP
│   ├── Scrap Market (Live Prices)
│   ├── Device Intake
│   ├── Business Analytics
│   ├── Subscriptions
│   └── Recycler Profile
│
└── SHARED SERVICES
    ├── Firebase Auth + Firestore
    ├── Gemini 1.5 Flash (AI Vision)
    ├── Metal Price API (Live Rates)
    └── YouTube Data API (Disassembly Videos)
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19 + Vite 8 | Blazing-fast SPA with HMR |
| Styling | TailwindCSS 3.4 | Utility-first dark theme with glassmorphism |
| Animations | Framer Motion | Page transitions and micro-interactions |
| AI Vision | Google Gemini 1.5 Flash | Real-time device identification and material analysis |
| Auth | Firebase Authentication | Google OAuth + Email/Password |
| Database | Cloud Firestore | Real-time sync, leaderboards, user profiles |
| Charts | Recharts | Analytics dashboards and material breakdowns |
| Camera | MediaDevices API | Cross-device camera with multi-constraint fallback |
| Drag and Drop | react-dropzone | Image upload with drag-and-drop support |
| Effects | canvas-confetti | Celebration animations on recycling submissions |

---

## ⚡ Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/nexora-hackathon/Flow-State.git
cd Flow-State

# Install dependencies
npm install

# Create environment file
# Add your API keys (see Environment Variables below)

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the project root:

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com/app/apikey)

---

## 📱 Demo Walkthrough

### User Flow

1. **Login** — Choose "User" role, sign in with Google
2. **Scan** — Point camera at any electronic device OR upload a photo
3. **Results** — View AI-identified device, material breakdown, scrap value
4. **Submit** — Earn eco-points and climb the leaderboard
5. **Dashboard** — Track your environmental impact over time

### Recycler Flow

1. **Login** — Choose "Recycler" role, sign in with Google
2. **Market** — View live scrap commodity prices
3. **Intake** — Process incoming e-waste with AI classification
4. **Analytics** — Monitor business performance metrics
5. **Subscriptions** — Manage your plan tier

---

## 📂 Project Structure

```
src/
├── components/
│   ├── AnimatedCounter.jsx       # Smooth number transitions
│   ├── ParticleBackground.jsx    # Ambient particle effects
│   ├── UserSidebar.jsx           # User navigation
│   ├── RecyclerSidebar.jsx       # Recycler navigation
│   └── ScrapTicker.jsx           # Live price ticker
│
├── context/
│   ├── AuthContext.jsx            # Authentication and user state
│   ├── AppContext.jsx             # Global app state
│   └── LanguageContext.jsx        # i18n support
│
├── pages/
│   ├── Scanner.jsx                # AI vision scanner
│   ├── Dashboard.jsx              # User impact dashboard
│   ├── Leaderboard.jsx            # Global rankings
│   ├── Profile.jsx                # User profile and settings
│   ├── Login.jsx                  # Auth screen
│   └── recycler/
│       ├── Market.jsx             # Scrap commodity market
│       ├── Intake.jsx             # Device intake system
│       ├── Analytics.jsx          # Business analytics
│       ├── Subscriptions.jsx      # Plan management
│       └── RecyclerProfile.jsx    # Business profile
│
├── utils/
│   ├── geminiScanner.js           # Gemini AI integration
│   ├── metalPrices.js             # Live metal price fetcher
│   ├── youtubeApi.js              # Disassembly video search
│   ├── aiMatcher.js               # Recycler matching engine
│   └── sound.js                   # Audio feedback
│
├── firebase.js                    # Firebase configuration
├── App.jsx                        # Role-based routing
└── main.jsx                       # Entry point
```

---

## 🌱 Impact Metrics

| Metric | Description |
|--------|-------------|
| CO2 Tracking | Calculates carbon savings per recycled device |
| Material Recovery | Tracks gold, copper, lithium, aluminium extracted |
| Scrap Valuation | Real-time INR pricing from commodity markets |
| Gamification | Points system incentivizing responsible disposal |

---

## 👥 Team — Nexora

Built with 💚 for a cleaner, greener future.

---

## 📄 License

This project is built for the hackathon submission. All rights reserved.

---

**PUNARNAVA** — *Recycle. Renew. Restore.* ♻️

*Turning e-waste into eco-impact, one scan at a time.*
