# Server Not Starting - Troubleshooting Guide

## Issue
The server is not starting and not responding on localhost:5000. The most common cause is a **database connection failure**.

## Solution Steps

### Step 1: Check if PostgreSQL is Running
The server requires PostgreSQL to be running. Check if PostgreSQL service is active:

**Windows:**
- Open Services (services.msc)
- Look for "postgresql-x64-16" or similar
- If not running, start the service

**Or from Command Prompt:**
```
netstat -ano | findstr :5432
```
If port 5432 is in use, PostgreSQL is running.

### Step 2: Verify Database Connection String
Check the `.env` file in the project root:

```
DATABASE_URL="postgresql://postgres:userToadmindatebase745@localhost:5432/5r_associates"
```

Make sure:
- **Username**: `postgres` 
- **Password**: `userToadmindatebase745` (matches your PostgreSQL password)
- **Host**: `localhost`
- **Port**: `5432` (PostgreSQL default)
- **Database**: `5r_associates` (database must exist)

### Step 3: Create Database if it Doesn't Exist
If the database doesn't exist, create it:

**Using pgAdmin (GUI):**
1. Open pgAdmin
2. Right-click on "Databases"
3. Create new database named `5r_associates`

**Using Command Line (psql):**
```sql
CREATE DATABASE 5r_associates;
```

### Step 4: Run Database Migrations
After creating the database, run Prisma migrations:

```bash
cd backend
npx prisma migrate deploy
cd ..
```

### Step 5: Start the Server
Once everything is set up:

```bash
npm start
```

You should see:
```
✓ Database connected

╔════════════════════════════════════════════════════════════╗
║  5R Associates - Construction Service Platform             ║
║  Server running on http://localhost:5000                      ║
║  Environment: development                                  ║
║  Frontend: http://localhost:5000                 ║
╚════════════════════════════════════════════════════════════╝
```

## If Still Having Issues

### Check PostgreSQL Status
```bash
# Windows - check if service is running
Get-Service postgres* | Select-Object Name, Status

# Or try to connect directly
psql -U postgres -d 5r_associates
```

### View Server Errors
Run server without npm to see actual errors:
```bash
cd backend
node server.js
```

### Verify .env File
The `.env` file should have correct database credentials. If you changed your PostgreSQL password, update it in `.env`

### Check Port 5000 is Available
```bash
netstat -ano | findstr :5000
```

If something is using port 5000, either:
- Stop that service
- Change PORT in `.env` to a different port (e.g., 3000)

## Quick Checklist
- [ ] PostgreSQL is running and accessible
- [ ] Database `5r_associates` exists
- [ ] `.env` file has correct DATABASE_URL
- [ ] Port 5000 is available
- [ ] Prisma migrations have been run (`npx prisma migrate deploy`)

After fixing the issue, try again and the server should start successfully!
