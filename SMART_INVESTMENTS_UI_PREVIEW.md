# Smart Investments UI Preview

## Finance Dashboard - Smart Features Grid Layout

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         FINANCE DASHBOARD                                            │
│                                                                                      │
│  [Stats Cards: Balance, Income, Expenses]                                           │
│                                                                                      │
│  [Transaction Chart]                           [Transaction Audit Log]              │
│                                                                                      │
│  [Active Liabilities & Recurring Cycles]                                            │
│                                                                                      │
│  ┌──────────── SMART FEATURES GRID ────────────────────────────────────────────┐   │
│  │                                                                               │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌──────────────────────┐           │   │
│  │  │  📈 Balance   │  │  📊 Spending  │  │  ⚡ Smart           │◄── NEW!    │   │
│  │  │   Forecast    │  │   Insights    │  │    Investments       │           │   │
│  │  │               │  │               │  │                      │           │   │
│  │  │ • 30/60/90D   │  │ • Category    │  │ 💵 TOP 10 STOCKS    │           │   │
│  │  │   Projection  │  │   Trends      │  │                      │           │   │
│  │  │ • Balance     │  │ • Anomalies   │  │ #1 AAPL    +1.69% ↑ │           │   │
│  │  │   Charts      │  │ • Duplicates  │  │    $150.25  89.2M    │           │   │
│  │  │ • Alerts      │  │               │  │                      │           │   │
│  │  │               │  │               │  │ #2 TSLA    -2.34% ↓ │           │   │
│  │  │               │  │               │  │    $245.80  125.4M   │           │   │
│  │  │               │  │               │  │                      │           │   │
│  │  │               │  │               │  │ #3 MSFT    +0.92% ↑ │           │   │
│  │  │               │  │               │  │    $385.10  45.7M    │           │   │
│  │  │               │  │               │  │                      │           │   │
│  │  │               │  │               │  │ ... 7 more stocks    │           │   │
│  │  │               │  │               │  │                      │           │   │
│  │  │               │  │               │  │ ⚡ TOP 10 CRYPTO     │           │   │
│  │  │               │  │               │  │                      │           │   │
│  │  │               │  │               │  │ #1 BTC     +3.45% ↑ │           │   │
│  │  │               │  │               │  │    $45,231  $25.3B   │           │   │
│  │  │               │  │               │  │                      │           │   │
│  │  │               │  │               │  │ #2 ETH     +2.18% ↑ │           │   │
│  │  │               │  │               │  │    $2,487   $12.1B   │           │   │
│  │  │               │  │               │  │                      │           │   │
│  │  │               │  │               │  │ #3 USDT    -0.01% ↓ │           │   │
│  │  │               │  │               │  │    $1.00    $45.8B   │           │   │
│  │  │               │  │               │  │                      │           │   │
│  │  │               │  │               │  │ ... 7 more crypto    │           │   │
│  │  │               │  │               │  │                      │           │   │
│  │  │               │  │               │  │ ────────────────────│           │   │
│  │  │               │  │               │  │ Data refreshed      │           │   │
│  │  │               │  │               │  │ every 24 hours      │           │   │
│  │  └───────────────┘  └───────────────┘  └──────────────────────┘           │   │
│  │                                                                               │   │
│  └───────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Component Details

### Smart Investments Panel Features

#### Header
- **Icon**: ⚡ Activity icon
- **Title**: "Smart Investments" (uppercase, bold)
- **Subtitle**: "Most Traded" (small, muted)

#### Stock Section
- **Title**: 💵 TOP 10 STOCKS
- **Each Stock Entry Shows**:
  - Rank number (#1, #2, etc.)
  - Ticker symbol (e.g., AAPL, TSLA)
  - Price with $ formatting
  - 24h change percentage (color-coded)
    - Green ↑ for positive changes
    - Red ↓ for negative changes
  - Trading volume (e.g., "Vol: 89.2M")

#### Crypto Section
- **Title**: ⚡ TOP 10 CRYPTO
- **Each Crypto Entry Shows**:
  - Rank number (#1, #2, etc.)
  - Symbol (e.g., BTC, ETH)
  - Full name (e.g., Bitcoin, Ethereum)
  - Price with $ formatting and commas
  - 24h change percentage (color-coded)
    - Green ↑ for positive changes
    - Red ↓ for negative changes
  - Trading volume in billions (e.g., "Vol: $25.3B")

#### Footer
- **Message**: "Data refreshed every 24 hours"
- Styled as: uppercase, small, centered, muted color

### Design System Consistency

The new Smart Investments panel follows the existing "tech-card" design system:
- ✅ Border styling matches other cards
- ✅ Typography (mono font for numbers, uppercase labels)
- ✅ Color scheme (muted grays, accent colors for changes)
- ✅ Padding and spacing consistent
- ✅ Hover states for interactivity
- ✅ Loading and error states implemented

### Responsive Behavior

- **Desktop (lg+)**: 3-column grid layout
- **Tablet/Mobile**: Stacks vertically in single column
- Each panel maintains full width on smaller screens

### Data Display

**Stocks:**
- Source: Alpha Vantage API
- Metric: Most actively traded by volume
- Update: Every 24 hours
- Limit: Top 10

**Crypto:**
- Source: CoinGecko API
- Metric: Highest trading volume
- Update: Every 24 hours
- Limit: Top 10

### User Experience

**Loading State:**
```
┌────────────────────┐
│ ⚡ Smart          │
│   Investments      │
│                    │
│ [Loading spinner]  │
│                    │
└────────────────────┘
```

**Error State:**
```
┌────────────────────┐
│ ⚡ Smart          │
│   Investments      │
│                    │
│   ⚡ (icon)        │
│   Unable to load   │
│   market data      │
│   Try again later  │
│                    │
└────────────────────┘
```

**Success State:**
Full display with stocks and crypto as shown in main diagram above.

## Color Coding

- **Positive Changes**: `#22c55e` (green) with ↑ arrow
- **Negative Changes**: `#ef4444` (red) with ↓ arrow
- **Background**: Alternating muted gray for list items
- **Text**: 
  - Primary: Dark gray/black
  - Secondary: Light gray `#666`
  - Muted: `#999`

## Typography

- **Card Title**: 14px, bold, uppercase, 0.5px letter-spacing
- **Section Headers**: 10px, uppercase, 1px letter-spacing, muted
- **Ticker/Symbol**: 12px, bold
- **Price**: 11px, bold
- **Volume**: 10px, monospace, muted
- **Change %**: 11px, bold, monospace, color-coded

This layout integrates seamlessly with the existing Finance Dashboard while providing valuable real-time market insights to users.
