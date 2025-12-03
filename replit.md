# Gelatina Reductora - React PWA

## Overview
A mobile-first Progressive Web App built with React, TypeScript, and Vite. This is a health and wellness product showcase app with a Spanish interface featuring product catalogs, bonuses, and exclusive locked content. Integrates with Hotmart to verify user purchases.

## Project Information
- **Framework**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 6.x
- **Styling**: Tailwind CSS (CDN for development)
- **Icons**: Lucide React
- **Backend**: Express.js on port 3001
- **Database**: Supabase (PostgreSQL)
- **Target**: Mobile-first responsive design

## Architecture
- **Entry Point**: `index.tsx` renders `App.tsx`
- **Frontend Components**:
  - `App.tsx`: Main application logic and routing
  - `LoginView.tsx`: User authentication screen
  - `HomeView.tsx`: Main product catalog with carousels (dynamic based on purchases)
  - `ProfileView.tsx`: User profile management
  - `ProductDetailView.tsx`: Product details overlay
  - `TabBar.tsx`: Bottom navigation
- **Backend (server/)**:
  - `index.ts`: Express server with API routes
  - `supabase.ts`: Supabase client and database functions
  - `productMapping.ts`: Hotmart product ID to app product ID mapping
- **API Client (lib/)**:
  - `api.ts`: Frontend API service
  - `useUserProducts.ts`: React hook for fetching user purchases

## Key Features
- User login and profile management
- **Hotmart Integration**: Verifies user purchases to unlock content
- **Dynamic Content Access**:
  - "Mis Productos": Shows only purchased products
  - "Contenidos Exclusivos": Shows locked/unpurchased products
  - "Bonos": Always available to all users
- Product carousels with drag-to-scroll functionality
- Locked premium content with upgrade prompts
- Full PWA installation capability with native install prompt
- Fallback installation instructions for iOS (Share → Add to Home Screen) and Android (Menu → Install app)
- Service worker for offline capability
- Local storage for user preferences
- Daily motivational quotes

## Hotmart Integration

### API Endpoints
- `GET /api/health`: Health check
- `GET /api/user/products?email=user@email.com`: Get user's purchased and locked products
- `POST /api/hotmart/webhook`: Receives Hotmart purchase/refund notifications
- `POST /api/admin/add-purchase`: Manual purchase addition (admin only)

### Webhook Events Handled
- `PURCHASE_APPROVED` / `PURCHASE_COMPLETE`: Adds product access
- `PURCHASE_REFUNDED`: Removes product access
- `PURCHASE_CANCELED` / `PURCHASE_CHARGEBACK`: Removes product access

### Product Mapping
Edit `server/productIds.json` to configure Hotmart product IDs and checkout offer codes:
- `p1`, `p2`, `p3`: Main products
- `l1`, `l2`: Exclusive content products

Each product needs:
- `hotmartProductId`: The product ID from Hotmart (for webhook processing)
- `offerCode`: The offer code for checkout popup (found in Hotmart pricing/offers section)

### Checkout Popup
When a user clicks on a locked product, a modal appears with the product info and a "Comprar Ahora" button that opens the Hotmart checkout popup directly in the app. The checkout popup pre-fills the user's email for convenience.

### Required Secrets
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_KEY`: Supabase service role key
- `HOTMART_WEBHOOK_SECRET`: Hotmart webhook token (x-hotmart-hottok header) - configure this in Hotmart dashboard
- `ADMIN_API_KEY`: Admin API key for manual purchases (optional)

### Webhook Security
The webhook uses Hotmart's token-based authentication via the `x-hotmart-hottok` header. When you configure your webhook URL in Hotmart's dashboard, you'll set a token that Hotmart sends with each request. Store this same token as `HOTMART_WEBHOOK_SECRET` in Replit secrets.

### Database Setup
Run the SQL in `database/schema.sql` in your Supabase SQL Editor to create all required tables:

**Tables:**
1. **purchases** - Stores Hotmart purchase records (product access)
2. **user_profiles** - Stores user profile data (name, avatar)
3. **protocol_progress** - Stores protocol completion progress (days completed)
4. **weight_entries** - Stores weight tracking data for the tracker feature

All user data is now stored in the cloud database, so users can access their data from any device.

## Development
- **Frontend Port**: 5000 (Vite dev server)
- **Backend Port**: 3001 (Express API server)
- **Host**: 0.0.0.0 with allowedHosts set to `true` for Replit proxy
- **Dev Command**: `npm run dev` (runs both frontend and backend)
- **Client Only**: `npm run client`
- **Server Only**: `npm run server`
- **Build Command**: `npm run build`

## Deployment

### Vercel (Recommended)
The app is configured to deploy on Vercel with serverless functions for the API.

**Structure:**
- Frontend: Built with Vite, served as static files
- Backend: Serverless functions in `/api` folder

**Serverless Functions:**
- `api/health.ts`: Health check endpoint
- `api/products/info.ts`: List all products
- `api/products/[productId]/info.ts`: Get specific product info
- `api/user/products.ts`: Get user's purchased products
- `api/hotmart/webhook.ts`: Hotmart webhook handler
- `api/admin/add-purchase.ts`: Manual purchase (admin)

**Environment Variables (Vercel Dashboard):**
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_KEY`: Supabase service role key
- `HOTMART_WEBHOOK_SECRET`: Hotmart webhook token
- `ADMIN_API_KEY`: Admin API key (optional)

**Hotmart Webhook URL:**
```
https://YOUR-DOMAIN.vercel.app/api/hotmart/webhook
```

### Replit
- **Type**: Static site deployment
- **Build Output**: `dist/` directory
- **Build Command**: `npm run build`

## Security Notes
- The app originally referenced `GEMINI_API_KEY` but doesn't use it in the code
- API key exposure risk removed from Vite config to prevent secrets in client bundle
- If API integration is added later, handle secrets server-side or use VITE_ prefixed public variables

## Recent Changes
- 2025-12-03: Cloud Database Migration for User Data
  - Migrated user profile data (name, avatar) from localStorage to Supabase
  - Migrated protocol progress (completed days) from localStorage to Supabase
  - Migrated weight tracker data from localStorage to Supabase
  - Created new database tables: user_profiles, protocol_progress, weight_entries
  - Added new API endpoints for profile, protocol progress, and weight entries
  - Data now syncs across devices - users won't lose data if they change phones
  - Fallback to localStorage if database is not configured
  - Updated schema.sql with all new table definitions

- 2025-12-03: Vercel Deployment with Serverless Functions
  - Created `/api` folder with serverless functions for Vercel
  - Webhook, user products, product info all work on Vercel
  - Fixed folder structure (using `_lib/` prefix for utilities)
  - Added `vercel.json` configuration
  - Tested and confirmed working with Hotmart webhooks

- 2025-12-03: Hotmart Checkout Popup Integration
  - Added Hotmart checkout popup that opens when clicking on locked products
  - Created `server/productIds.json` file for easy product configuration
  - Added offerCode field to enable checkout popup for each product
  - Modal shows product image, title, and "Comprar Ahora" button
  - Checkout pre-fills user email for convenience
  - Added loading and error states for better UX
  - Added endpoints for fetching product info with offerCode

- 2025-12-03: Hotmart Integration
  - Added Express.js backend on port 3001
  - Integrated Supabase for storing purchase records
  - Created Hotmart webhook endpoint for automatic purchase/refund processing
  - Fixed webhook authentication to use Hotmart's token-based verification (x-hotmart-hottok header)
  - Updated HomeView to dynamically show products based on user purchases
  - "Mis Productos" now shows only purchased products
  - "Contenidos Exclusivos" now shows locked products user hasn't purchased
  - "Bonos" remains free for all users
  - Added product mapping for Hotmart product IDs
  - Created database schema for purchases table

- 2025-11-27: Hardware back button control for mobile
  - Implemented proper history management for mobile back button
  - Back button now closes overlays (product detail, upgrade modal, install instructions) instead of exiting the app
  - Uses refs (historyPushedRef, isProgrammaticBackRef) to prevent phantom history entries
  - UI close actions and hardware back button both properly manage history stack
  - When no overlays are open, back button exits the app normally

- 2025-11-27: Profile editing and cache improvements
  - Simplified profile editing: photo can now be changed directly by tapping the avatar
  - Added inline name editing with visible pencil icon (touch-friendly)
  - Removed separate "Datos Personales" screen for simpler UX
  - Changed Service Worker from cache-first to network-first strategy
  - This prevents white screen issues after app updates

- 2025-11-26: Initial import and Replit setup
  - Migrated from AI Studio platform to Replit environment
  - Removed AI Studio CDN import maps from index.html
  - Configured Vite to use port 5000 with proper host allowlist
  - Fixed potential security issue by removing API key from client bundle
  - Set up development workflow and static deployment configuration
