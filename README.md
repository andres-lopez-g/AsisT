# AsisT - Smart Personal Assistant

AsisT is a minimalist yet powerful personal management platform designed to help you organize your finances and productivity in one place. Built with a focus on speed, aesthetics, and user experience.

![AsisT Logo](/public/favicon.png)

## 🚀 Features

### 1. Unified Home Dashboard
- **Personalized Welcome**: Start your day with a quick overview of your status.
- **Financial Pulse**: Immediate balance analysis (Income vs. Expenses).
- **Next Tasks Widget**: Keep track of your most urgent pending items without leaving the home screen.

### 2. Intelligent Finance Manager
- **Transaction Tracking**: Log income and expenses with categories and dates.
- **Visual Analytics**: Interactive area charts showing your historical balance over the last 7 days.
- **Statistics Cards**: Quick view of total balance, total income, and total expenses.

### 3. Productivity Planner
- **Kanban Board**: Manage tasks through "To Do", "In Progress", and "Done" states.
- **Priority System**: Categorize tasks by priority (High, Medium, Low) with visual color codes.
- **Responsive Layout**: Designed to work perfectly on both desktop and mobile devices.

### 4. Robust Security
- **Authentication**: Secure JWT-based login and registration system.
- **Protection**: Integrated Rate Limiting to prevent brute-force attacks.
- **Privacy**: Environment variables protection and secure database connections via SSL.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide icons, Recharts, Framer Motion.
- **Backend**: Node.js, Express, JWT, Bcryptjs.
- **Database**: PostgreSQL (Supabase/Vercel Postgres compatible).
- **Deployment**: Optimized for Vercel.

## 📦 Getting Started

### Prerequisites
- Node.js installed.
- A PostgreSQL database (Local or Cloud).

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`.
4. Run the database setup:
   ```bash
   npm run db:setup
   ```
5. Start development:
   ```bash
   npm start
   ```

## 🌐 Deployment

This project is configured for one-click deployment to **Vercel**.
- **Backend**: Runs as Serverless Functions.
- **Frontend**: Served as a high-performance static site.
- **Configuration**: See `vercel.json` for details.

---
*Built with ❤️ for better productivity.*
