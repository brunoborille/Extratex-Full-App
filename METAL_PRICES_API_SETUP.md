# Metal Prices API Integration

This application now includes automatic fetching of real-time metal prices from the Metals-API service.

## Features

- **LME Copper Prices**: London Metal Exchange copper prices (USD/MT)
- **LBMA Gold Prices**: London Bullion Market Association gold prices (USD/Oz)
- **LBMA Silver Prices**: London Bullion Market Association silver prices (USD/Oz)

## How It Works

The application uses a Supabase Edge Function (`fetch-metal-prices`) that connects to the Metals-API service to retrieve live prices. When you click the "Fetch Live Prices" button in the Provisional Prices section, the app automatically:

1. Calls the edge function
2. Retrieves current metal prices
3. Populates the price fields with live data

## Setup Instructions

### Step 1: Get Your Metals-API Key

1. Visit [https://metals-api.com](https://metals-api.com)
2. Sign up for a free account
3. Copy your API key from the dashboard

**Note**: The free tier includes:
- 50 API calls per month
- Real-time data
- LME and LBMA price support

### Step 2: Configure the API Key in Supabase

You need to add your Metals-API key as a secret in your Supabase project:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Edge Functions**
4. Under **Secrets**, click "Add new secret"
5. Add a new secret:
   - **Name**: `METALS_API_KEY`
   - **Value**: Your Metals-API key

### Step 3: Test the Integration

1. Open your application
2. Navigate to the Provisional Prices section
3. Click the "Fetch Live Prices" button
4. The fields should populate with current market prices

## Price Details

### Copper (LME-XCU)
- **Source**: London Metal Exchange
- **Unit**: USD per Metric Ton (MT)
- **Symbol**: LME-XCU
- **Conversion**: Price per pound × 2,204.62 = Price per MT

### Gold (XAU)
- **Source**: LBMA (London Bullion Market Association)
- **Unit**: USD per Troy Ounce
- **Symbol**: XAU
- **Market**: Spot price

### Silver (XAG)
- **Source**: LBMA (London Bullion Market Association)
- **Unit**: USD per Troy Ounce
- **Symbol**: XAG
- **Market**: Spot price

## API Response Format

The edge function returns the following JSON structure:

```json
{
  "success": true,
  "prices": {
    "copper": 9500.00,
    "gold": 2650.00,
    "silver": 31.50
  },
  "timestamp": 1234567890,
  "date": "2024-01-31"
}
```

## Troubleshooting

### "METALS_API_KEY not configured" Error

This means the API key hasn't been added to Supabase secrets. Follow Step 2 above.

### "Failed to fetch metal prices" Error

Possible causes:
- Invalid API key
- API rate limit exceeded (free tier: 50 calls/month)
- Network connectivity issues

### Prices Not Updating

1. Check the browser console for errors
2. Verify your API key is correct in Supabase
3. Ensure you haven't exceeded your API rate limit

## Alternative Free APIs

If you prefer not to use Metals-API, here are alternatives:

- **Metals.dev**: Similar service with free tier
- **MetalPriceAPI**: Another option for precious metals
- **Commodities-API**: Broader commodity coverage

To switch APIs, you'll need to modify the edge function at:
`supabase/functions/fetch-metal-prices/index.ts`

## Cost Considerations

**Free Tier Limits**:
- Metals-API Free: 50 requests/month
- For production use, consider upgrading to a paid plan

**Optimization Tips**:
- Cache prices locally to reduce API calls
- Fetch prices once per day rather than on every calculation
- Consider upgrading to a paid tier if you need frequent updates

## Support

For API-related issues, contact:
- Metals-API Support: [https://metals-api.com](https://metals-api.com)
- Supabase Support: [https://supabase.com/support](https://supabase.com/support)
