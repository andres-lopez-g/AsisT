# Gemini Bot Implementation

## Overview

This implementation adds an AI-powered assistant bot to AsisT using Google's Gemini API. The bot provides personalized financial recommendations and productivity tips based on user data.

## Features

### 1. **Chat Interface**
- Real-time chat with AI assistant
- Message history persistence
- Context-aware responses based on user's financial and productivity data

### 2. **Financial Recommendations**
- Analyzes current balance, income, expenses, and debts
- Provides specific, actionable financial advice
- Categorizes spending patterns

### 3. **Productivity Tips**
- Evaluates task management patterns
- Identifies overcommitment risks
- Suggests productivity improvements

## Setup

### Prerequisites
- Node.js and npm installed
- PostgreSQL database (Supabase recommended for free tier)
- Google Gemini API key (free tier available)

### Configuration

1. **Get your Gemini API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a free API key
   - Copy the key

2. **Set Environment Variable**
   Add to your `.env` file or Vercel environment variables:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Run Database Migration**
   The bot requires a `bot_conversations` table to store chat history.
   
   For Supabase:
   - Open your Supabase project
   - Go to SQL Editor
   - Run the migration from `/server/migrations/migration_gemini_bot.sql`

   For local PostgreSQL:
   ```bash
   psql -d your_database -f server/migrations/migration_gemini_bot.sql
   ```

## API Endpoints

### `GET /api/gemini/status`
Check if Gemini API is configured and available.

**Response:**
```json
{
  "available": true,
  "message": "Gemini API is ready"
}
```

### `POST /api/gemini/chat`
Send a message to the AI assistant.

**Request:**
```json
{
  "message": "¿Cómo puedo ahorrar más dinero?"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Basado en tu situación financiera...",
  "timestamp": "2024-02-06T15:30:00.000Z"
}
```

### `GET /api/gemini/recommendations/financial`
Get personalized financial recommendations.

**Response:**
```json
{
  "success": true,
  "recommendations": "1. Reducir gastos en...\n2. Aumentar ahorros...",
  "timestamp": "2024-02-06T15:30:00.000Z"
}
```

### `GET /api/gemini/recommendations/productivity`
Get productivity improvement tips.

**Response:**
```json
{
  "success": true,
  "tips": "1. Prioriza tareas urgentes...\n2. Divide tareas grandes...",
  "timestamp": "2024-02-06T15:30:00.000Z"
}
```

### `GET /api/gemini/history`
Get chat conversation history.

**Query Parameters:**
- `limit` (optional): Number of conversations to return (default: 10)

**Response:**
```json
{
  "conversations": [
    {
      "id": 1,
      "user_message": "¿Cómo están mis finanzas?",
      "bot_response": "Tu balance actual es...",
      "created_at": "2024-02-06T15:30:00.000Z"
    }
  ]
}
```

## Frontend Component

The bot UI is located at `/src/features/gemini/GeminiBot.jsx` and is accessible via the navigation menu as "AI Assistant".

### Features:
- **Quick Actions**: One-click buttons for financial and productivity recommendations
- **Chat Interface**: Text input with real-time responses
- **Message History**: Automatically loads previous conversations
- **Error Handling**: Graceful fallback when API is not configured

## Architecture

### Backend Services

1. **`geminiService.js`**: Core service for interacting with Gemini API
   - `generateResponse()`: General chat responses with user context
   - `getFinancialRecommendations()`: Specialized financial analysis
   - `getProductivityTips()`: Task management suggestions

2. **`geminiBot.js`**: Express routes handling HTTP requests
   - Authenticates users
   - Fetches user context (balance, tasks, etc.)
   - Stores conversation history
   - Returns formatted responses

### Database Schema

```sql
CREATE TABLE bot_conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Usage on Free Tier

This implementation is optimized for free tier usage:

### Gemini API (Google)
- **Free Tier**: 60 requests per minute
- **Model**: gemini-pro (free)
- **Cost**: $0

### Vercel
- **Serverless Functions**: 100 GB-hours/month
- **Deployments**: Unlimited
- **Cost**: $0

### Supabase
- **Database**: 500 MB storage
- **API Requests**: Unlimited
- **Cost**: $0

## Deployment

### On Vercel

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `GEMINI_API_KEY` with your API key
   - Redeploy the project

3. **Run Database Migration**
   - Connect to your Supabase database
   - Execute the migration SQL file

### Testing Locally

1. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the app**
   ```bash
   npm start
   ```

4. **Access the bot**
   - Navigate to `http://localhost:5173/bot` after logging in

## Security Considerations

- API key is stored server-side only (never exposed to client)
- All routes require authentication
- User data is isolated (RLS recommended for Supabase)
- Rate limiting is applied at the server level

## Future Enhancements

- **Multi-language support**: Detect user language and respond accordingly
- **Voice input/output**: Add speech recognition and synthesis
- **Scheduled notifications**: Proactive financial alerts
- **Advanced analytics**: Sentiment analysis and trend predictions
- **Export conversations**: Download chat history as PDF

## Troubleshooting

### "Bot No Disponible" Message
- Ensure `GEMINI_API_KEY` is set in environment variables
- Verify the API key is valid at [Google AI Studio](https://aistudio.google.com/app/apikey)
- Check server logs for initialization errors

### API Rate Limits
- Free tier: 60 requests/minute
- Implement client-side request throttling if needed
- Consider upgrading to paid tier for production

### Database Errors
- Ensure migration has been run
- Verify database connection string
- Check Supabase/PostgreSQL logs

## License

Part of AsisT - Smart Personal Assistant
Built with ❤️ for better productivity.
