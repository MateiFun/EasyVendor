# EasyVendor

A multi-vendor food ordering platform for schools where students create stores, list food items, and receive orders from peers.

## Features Implemented (Phase 2)

### Backend API
- **Authentication** - Register/Login with JWT tokens
- **Store Management** - Create, update, view stores
- **Menu Management** - Add/edit menu items with inventory
- **Real-time Updates** - Socket.io for instant notifications

### Web Dashboard
- **Login/Register** - Create account or login
- **Store Creation Form** - GUI to set up store with name, description, location, hours
- **Store Management** - View and edit store details
- **Modern UI** - Beautiful forms with validation and error handling

## Quick Start

### Prerequisites
- Node.js (v14+)
- PostgreSQL 17

### 1. PostgreSQL Setup

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed setup instructions.

**Quick steps:**
```bash
# After PostgreSQL is installed, create database:
psql -U postgres
CREATE DATABASE easyvendor;
\q
```

Update `backend/.env`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/easyvendor
JWT_SECRET=your_secret_key
```

### 2. Backend Setup & Run

```bash
cd backend
npm install  # (already installed, but if you need to reinstall)
npm run dev
```

Backend runs on: **http://localhost:5000**

### 3. Web Dashboard Setup & Run

```bash
cd web/easyvendor-web
npm install  # (already installed)
npm start
```

Web app runs on: **http://localhost:3000**

### 4. Mobile App Setup & Run (Optional)

```bash
cd mobile/easyvendor-mobile
npm install  # (already installed)
npm start
```

## Testing the Store Creation Feature

1. **Open web dashboard** - http://localhost:3000
2. **Create Account**:
   - Click "Sign Up"
   - Enter name, email, password
   - Select "Store Owner"
   - Click Register
3. **Create Your Store**:
   - Fill in store name, description, location, hours
   - Click "Create Store"
   - See your store details displayed
4. **Edit Store**:
   - Click "Edit Store" to modify details
5. **Test Backend API** (curl):

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@store.com","password":"pass123","userType":"seller"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@store.com","password":"pass123"}'

# Create Store (replace TOKEN with JWT from login)
curl -X POST http://localhost:5000/api/stores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"Pizza Place","description":"Fresh pizza","location":"School Cafeteria","hours":"10-4"}'

# Get all stores
curl http://localhost:5000/api/stores
```

## Project Structure

```
EasyVendor/
├── backend/
│   ├── config/
│   │   ├── db.js              # PostgreSQL connection
│   │   └── database.js        # Table initialization
│   ├── models/                # Data models (placeholder)
│   ├── routes/
│   │   ├── auth.js            # Authentication endpoints
│   │   ├── stores.js          # Store endpoints
│   │   ├── menu.js            # Menu endpoints
│   │   └── orders.js          # Order endpoints
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   └── errorHandler.js    # Error handling
│   ├── services/
│   │   ├── authService.js     # Auth logic (register/login)
│   │   ├── storeService.js    # Store logic
│   │   ├── menuService.js     # Menu logic
│   │   ├── orderService.js    # Order logic
│   │   ├── userService.js     # User logic
│   │   └── loyaltyService.js  # Loyalty logic
│   ├── server.js              # Express server
│   └── package.json
│
├── web/
│   └── easyvendor-web/
│       ├── src/
│       │   ├── pages/
│       │   │   ├── LoginPage.js        # Login/Register UI
│       │   │   └── StoreSetup.js       # Store creation form
│       │   ├── services/
│       │   │   └── api.js              # API client
│       │   ├── styles/
│       │   │   ├── Auth.css
│       │   │   └── StoreSetup.css
│       │   └── App.js
│       └── package.json
│
├── mobile/
│   └── easyvendor-mobile/  # React Native app (setup ready)
│
├── DATABASE_SETUP.md       # Detailed database setup
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Stores
- `POST /api/stores` - Create store (protected)
- `GET /api/stores` - Get all stores (public)
- `GET /api/stores/:storeId` - Get store details (public)
- `GET /api/stores/my-store` - Get logged-in user's store (protected)
- `PUT /api/stores` - Update store (protected)

### Menu Items
- `POST /api/menu` - Add menu item (protected)
- `GET /api/menu/store/:storeId` - Get store menu (public)
- `PUT /api/menu/:itemId` - Update menu item (protected)
- `DELETE /api/menu/:itemId` - Delete menu item (protected)

## Tech Stack

- **Backend**: Node.js, Express, PostgreSQL, JWT, bcrypt, Socket.io
- **Frontend**: React, Axios
- **Mobile**: React Native (Expo)
- **Real-time**: Socket.io

## Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- Protected routes require valid tokens
- SQL injection prevention with parameterized queries

## Next Steps (Phase 3+)

- [ ] Order creation and management
- [ ] Menu item inventory tracking
- [ ] Buyer store browsing UI
- [ ] Shopping cart functionality
- [ ] Order status tracking
- [ ] Loyalty points system
- [ ] Payment handling
- [ ] Admin dashboard

## Support

For database issues, see [DATABASE_SETUP.md](./DATABASE_SETUP.md)

Happy hacking!
