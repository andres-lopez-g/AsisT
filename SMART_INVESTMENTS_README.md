# Smart Investments Feature

## Overview
The Smart Investments feature displays the top 10 most actively traded stocks and cryptocurrencies, helping users stay informed about market trends.

## Features
- **Top 10 Stocks**: Shows the most actively traded stocks from Alpha Vantage
- **Top 10 Crypto**: Shows the highest volume cryptocurrencies from CoinGecko
- **24-Hour Caching**: Reduces API calls and stays within free tier limits
- **Graceful Fallback**: Falls back to cached data if API calls fail

## Setup Instructions

### 1. Database Migration
Run the database setup to create the `market_snapshots` table:

```bash
npm run db:setup
```

This will automatically run all migrations including the new `migration_market_snapshots.sql`.

### 2. API Keys Configuration

#### Alpha Vantage (Required for Stocks)
1. Get a free API key from https://www.alphavantage.co/support/#api-key
2. Add to your `.env` file:
   ```
   ALPHA_VANTAGE_API_KEY=your_key_here
   ```

#### CoinGecko (No API Key Required)
CoinGecko's free API is used for cryptocurrency data and doesn't require an API key.

### 3. Deploy
Deploy your application with the new environment variable:
- **Vercel**: Add `ALPHA_VANTAGE_API_KEY` in Project Settings → Environment Variables
- **Local**: Add to your `.env` file

## API Endpoint

### GET /api/smart/investments
Returns top 10 stocks and crypto with 24-hour caching.

**Authentication**: Required (Bearer token)

**Response**:
```json
{
  "stocks": [
    {
      "ticker": "AAPL",
      "price": 150.25,
      "change_amount": 2.50,
      "change_percentage": "+1.69%",
      "volume": 89234567
    }
    // ... 9 more
  ],
  "crypto": [
    {
      "id": "bitcoin",
      "symbol": "BTC",
      "name": "Bitcoin",
      "current_price": 45000,
      "price_change_percentage_24h": 2.5,
      "market_cap": 850000000000,
      "total_volume": 25000000000,
      "image": "https://..."
    }
    // ... 9 more
  ],
  "cached": {
    "stocks": true,
    "crypto": true
  }
}
```

## UI Integration
The SmartInvestments component is automatically displayed in the Finance Dashboard's Smart Features Grid, alongside the Balance Forecast and Spending Insights.

## Rate Limits & Caching
- **Alpha Vantage**: Free tier allows 25 requests per day
- **CoinGecko**: Free tier allows 10-50 calls per minute
- **Cache Duration**: 24 hours
- **Fallback**: Always uses most recent cache if API fails

## Database Schema

### market_snapshots Table
```sql
CREATE TABLE market_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('stock', 'crypto')),
  payload JSONB NOT NULL,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Error Handling
- API failures gracefully fall back to cached data
- If no API key is configured, the endpoint returns empty arrays
- If cache is also unavailable, returns empty arrays with appropriate logging

## Testing
```bash
# Build the application
npm run build

# Start the development server
npm start

# Navigate to Finance Dashboard to see Smart Investments panel
```

## Security Considerations
- API keys are stored server-side only
- All API calls happen on the backend
- No sensitive data exposed to client
- Rate limiting protects against abuse
- Uses read-only API endpoints

## Troubleshooting

### No Data Appearing
1. Check that `ALPHA_VANTAGE_API_KEY` is set
2. Check server logs for API errors
3. Verify database migration ran successfully
4. Check that you're authenticated

### Rate Limit Errors
The 24-hour cache should prevent rate limit issues. If you still hit limits:
1. Verify cache is working (check `market_snapshots` table)
2. Consider extending cache duration if needed
3. Check for multiple server instances making redundant calls

## Future Enhancements
- Add user preferences for favorite stocks/crypto
- Add price alerts
- Add historical charts
- Add portfolio tracking integration
