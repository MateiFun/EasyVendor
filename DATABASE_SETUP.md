# Database Setup Guide

## After PostgreSQL Installation

Once PostgreSQL 17 is installed, follow these steps:

### Step 1: Start PostgreSQL Service
- PostgreSQL should start automatically as a Windows service
- To verify it's running, open Command Prompt and test:
  ```
  psql --version
  ```

### Step 2: Create Database and User

1. Open PostgreSQL Command Prompt or use `psql`:
   ```bash
   psql -U postgres
   ```

2. Enter the password you set during PostgreSQL installation

3. Create a new database:
   ```sql
   CREATE DATABASE easyvendor;
   ```

4. Create a new user (optional, for security):
   ```sql
   CREATE USER easyvendor_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE easyvendor TO easyvendor_user;
   ```

5. Exit psql:
   ```sql
   \q
   ```

### Step 3: Update Backend Environment Variables

Edit `.env` in the `backend/` folder:

```
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/easyvendor
JWT_SECRET=your_super_secret_jwt_key_12345
NODE_ENV=development
```

Or if you created a separate user:
```
DATABASE_URL=postgresql://easyvendor_user:your_secure_password@localhost:5432/easyvendor
```

### Step 4: Run Backend

```bash
cd backend
npm run dev
```

The backend will automatically create all tables when it starts!

---

## Common Commands

**Connect to database:**
```bash
psql -U postgres -d easyvendor
```

**List all databases:**
```bash
\l
```

**List all tables:**
```bash
\dt
```

**Exit psql:**
```bash
\q
```

---

## Troubleshooting

- **"psql: command not found"** - PostgreSQL not in PATH. Add `C:\Program Files\PostgreSQL\17\bin` to your Windows PATH
- **"FATAL: password authentication failed"** - Wrong password, reinstall or reset using `psql` as `postgres` user
- **"Database already exists"** - The database was already created, you can proceed to the next step

