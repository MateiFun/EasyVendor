# EasyVendor - Next.js Edition

A full-stack website builder for food sellers - create beautiful online stores with drag-and-drop customization.

## Features

✨ **For Sellers:**
- Easy store setup with email & password
- Drag-and-drop store customizer (colors, title, branding)
- Add products with photos, prices, and stock
- Publish to get a live URL (`stores/yourstore`)
- View buyer orders and names

🛒 **For Buyers:**
- Browse published stores
- Add products to cart with quantity control
- See price preview before checkout
- Enter first & last name at checkout
- Guest checkout (no account required)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Frontend:** React 18
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL
- **Authentication:** JWT
- **Security:** bcrypt for passwords
- **Hosting:** Deploy to Vercel (free tier)

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 17
- Git

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Environment Variables

Update `.env.local`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/easyvendor
JWT_SECRET=your_jwt_secret_key_here
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Initialize Database

```bash
# Create the easyvendor database in PostgreSQL
psql -U postgres -c "CREATE DATABASE easyvendor;"

# Or use your PostgreSQL client GUI
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`:
- Create store: `/auth/seller-signup`
- Sign in: `/auth/seller-login`
- Editor: `/dashboard/editor`
- Buy from store: `/stores/[subdomain]`

## Project Structure

```
EasyVendor/
├── app/
│   ├── api/                          # API Routes
│   │   ├── auth/
│   │   │   ├── seller-signup/
│   │   │   └── seller-login/
│   │   └── stores/
│   │       ├── [subdomain]/          # Get published store
│   │       └── route.ts              # Save/publish store config
│   ├── auth/                         # Auth pages
│   │   ├── seller-signup/
│   │   └── seller-login/
│   ├── dashboard/
│   │   └── editor/                   # Store editor GUI
│   ├── stores/
│   │   └── [subdomain]/              # Buyer store view
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Home page
│   └── globals.css                   # Global styles
├── lib/
│   ├── db.ts                         # Database connection
│   └── initDb.ts                     # Database initialization
├── package.json
├── tsconfig.json
├── next.config.js
└── .env.local
```

## Database Schema

### Tables Created Automatically:

- **sellers** - Store owners (email, password, subdomain)
- **stores** - Store configurations (JSONB config, published flag)
- **products** - Items for sale (name, price, stock, image_url)
- **orders** - Guest/registered buyer orders
- **order_items** - Order line items
- **users** - Registered buyer accounts (for future loyalty features)

## Usage Guide

### Creating a Store

1. Go to `/auth/seller-signup`
2. Enter business name, email, password, unique subdomain
3. Click "Create Store"
4. You'll be redirected to `/dashboard/editor`

### Customizing Your Store

In the editor:
- Edit store title
- Choose background and title colors
- Toggle "require login" setting
- Click Save

### Adding Products

Use the products section to:
- Upload product photos
- Set prices and stock quantities
- Preview how it looks

### Publishing Your Store

- Click "Publish Store" button
- Your store goes live at: `http://localhost:3000/stores/[subdomain]`
- Share the URL with buyers!

### As a Buyer

1. Visit a published store URL
2. Browse products
3. Add items to cart
4. Enter first & last name at checkout
5. Place order (seller will see your name)

## API Endpoints

### Authentication
- `POST /api/auth/seller-signup` - Create new store
- `POST /api/auth/seller-login` - Sign in to store

### Stores
- `GET /api/stores` - Get current seller's store config (requires JWT)
- `PUT /api/stores` - Update store config (requires JWT)
- `POST /api/stores` - Publish store (requires JWT)
- `GET /api/stores/[subdomain]` - Get published store (public)

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/easyvendor.git
git push -u origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Import repository
4. Set environment variables (DATABASE_URL, JWT_SECRET, NEXT_PUBLIC_API_URL)
5. Deploy!

### 3. For PostgreSQL (Vercel)

Use a free hosting service:
- **Neon** - Free PostgreSQL (recommended)
- **Railway** - $5/month credit
- **Supabase** - Free tier with PostgreSQL

## Troubleshooting

**"Database connection failed"**
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env.local`
- Make sure `easyvendor` database exists

**"Port 3000 already in use"**
```bash
# On Windows
netstat -ano | findstr :3000

# Kill the process using that port
taskkill /PID [PID] /F
```

**"Subdomain already taken"**
- Choose a unique subdomain during signup
- Subdomains are unique across all stores

## Development Tips

- JWT tokens expire after 7 days
- Passwords are hashed with bcrypt (10 rounds)
- Store configuration is stored as JSONB for flexibility
- Images can be stored as URLs or uploaded to cloud storage

## Future Enhancements

- [ ] Drag-and-drop product builder
- [ ] Photo upload to cloud storage (AWS S3, Cloudinary)
- [ ] Buyer loyalty rewards
- [ ] Email notifications for orders
- [ ] Admin dashboard for analytics
- [ ] Payment integration (Stripe)
- [ ] Mobile app (React Native)

## License

MIT

## Support

For issues or questions, create an issue on GitHub!
