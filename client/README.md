# AceTheInterview 🧠⚡

<div align="center">
  <img src="https://img.shields.io/badge/Powered_by-Claude_AI-C8F135?style=for-the-badge&logo=anthropic&logoColor=0F0F0F" alt="Powered by Claude AI" />
  <img src="https://img.shields.io/badge/Next.js-14_App_Router-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Framer_Motion-Design-blue?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
</div>

<br />

**AceTheInterview** is an end-to-end, AI-powered mock interview platform that autonomously conducts personalized interviews tailored exactly to your resume, target role, and experience level. Rather than serving scripted Q&A, AceTheInterview dynamically adjusts its questioning based on your live responses, simulating the pressure and nuance of a real tech interview.

Built with a striking **Neo-Brutalist** design system (inspired by modern developer tools), it aims to make interview preparation engaging, rigorous, and highly actionable.

---

## 🔥 Features

### 1. Personalized Setup Phase
- **Resume Parsing:** Upload your PDF resume via a drag-and-drop interface.
- **Job Description Context:** Paste any live JD to anchor the interview questions.
- **Role & Level Configuration:** Select from entry-level to staff engineer across various domains (Frontend, Backend, DevOps, etc.).
- **Round Selection:** Tailor the session to focus on Behavioral, Technical, or System Design (or a mix of all three).

### 2. Live Adaptive Interview
- **Conversational AI Agent:** Powered by advanced LLMs (Claude AI) acting as a dynamic hiring manager.
- **Real-time Feedback Signals:** A live dashboard showing signals like Clarity, Depth, and Pace.
- **Multi-modal Input:** Answer via typing or text-to-speech (mic support).
- **Stress-tested Timer & Round Tracking:** Simulates real interview constraints.

### 3. Comprehensive Feedback Report
- **Overall Scoring:** Animated brutalist `ScoreRing` out of 100.
- **Categorical Breakdown:** Scores for Technical Depth, Communication, Problem Solving, and Behavioral Fit.
- **Strengths & Improvements:** Actionable bullet points highlighting exactly what you did well and what needs work.
- **Full Q&A Transcript:** Collapsible accordion UI to review specific questions and your exact answers alongside AI feedback.

### 4. Custom Neo-Brutalist UI Engine
- **`GridBackground`:** Reusable Codesphere-style dark mode square grid overlay.
- **Interactive Custom Cursor:** Smooth-following dot and ring cursor that reacts to hover and click events.
- **Brutalist Component Library:** Custom thick-bordered `<BrutalistCard>`, `<BrutalistButton>`, `<PhaseCard>`, and more, complete with hard shadows (`shadow-brutal`).
- **Smooth Animations:** Powered by Framer Motion for scroll reveals, staggered lists, and micro-interactions.

---

## 🛠 Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (v18+) and npm/pnpm installed.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Mr-spiky/AceTheInterview.git
   cd AceTheInterview
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open the app:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

AceTheInterview is architected around a highly modular component structure.

```
src/
├── app/                  # Next.js App Router pages (Home, Dashboard, Setup, Interview, Feedback)
├── lib/                  # Shared utilities and centralized data logic
│   └── constants.ts      # Single source of truth for mock data, roles, levels, and static content
└── components/
    ├── layout/           # Global layout elements (Navbar, Footer)
    ├── ui/               # Reusable shared Neo-brutalist primitives 
    │                     # (GridBackground, BrutalistCard, BrutalistButton, CustomCursor, Marquee)
    ├── setup/            # Components specific to the /setup route (ResumeUpload, RoundTypePicker)
    └── interview/        # Components specific to the live /interview route (ChatMessage, ChatInput, InterviewSidebar)
```

---

## 🎨 Design Philosophy (Neo-Brutalism)

The UI explicitly rejects standard flat design in favor of **Neo-Brutalism**. 
Key design tokens include:
- `bg-dark` (`#0F0F0F`) body background with `text-white`
- Accent color `text-lime` (`#C8F135`) for severe contrast
- Thick 3px solid black or white borders (`border-3`)
- Hard drop shadows without blur (`shadow-[4px_4px_0px_#000]`)
- Uppercase typography using **Space Grotesk** for headings and **Inter** for readable body text.

---

## 🛡 License

MIT License. Free to play around with, fork, and adapt for your own hackathons or learning projects. Build cool stuff!
