# OrderSync Pro

A Shopify embedded app that syncs and manages store orders in real-time.

## Features

- **Real-time Order Sync** - Automatically captures new orders via webhooks
- **Order Dashboard** - View all orders with customer info, totals, and timestamps
- **Cancellation Tracking** - Auto-removes cancelled orders from the database
- **Secure Webhooks** - HMAC-verified webhook handling

## Tech Stack

- **Framework**: Remix + React
- **Database**: SQLite with Prisma ORM
- **UI**: Shopify Polaris
- **Auth**: Shopify OAuth + App Bridge
- **API**: Shopify GraphQL Admin API

## Quick Start

```bash
# Install dependencies
npm install

# Setup database
npm run setup

# Run development server
npm run dev
```

## Environment Variables

Create a `.env` file:

```env
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_APP_URL=http://localhost:3000
SCOPES=read_products,write_products,read_orders,write_orders
```

## Project Structure

```
app/
├── routes/
│   ├── app._index.jsx      # Orders dashboard
│   ├── webhooks.jsx        # Webhook handlers
│   ├── app.jsx             # App layout with App Bridge
│   └── auth.login/         # Login page
├── shopify.server.js       # Shopify app config
└── db.server.js            # Prisma client

prisma/
└── schema.prisma           # Database schema
```

## Webhooks

| Topic | Action |
|-------|--------|
| `orders/create` | Saves order to database |
| `orders/cancelled` | Deletes order from database |

## Deployment

```bash
# Build for production
npm run build

# Deploy to Shopify
npm run deploy
```

## Requirements

- Node.js >= 20.19
- Shopify Partner account
- Development store for testing

## License

MIT
