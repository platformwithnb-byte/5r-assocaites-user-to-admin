# Login Setup Instructions

## If Login is Failing:

### Step 1: Open PowerShell/Command Prompt
Navigate to the project root:
```
cd "d:\VMB activity\AIPlayground\5r assocaites comms UtoA"
```

### Step 2: Create Fresh Test Users
Run this command:
```
cd backend && node quick-setup.js && cd ..
```

This will:
- Delete existing users
- Create fresh admin and user accounts
- Display credentials to use

### Step 3: Use These Credentials

After running quick-setup.js, you'll see output like:
```
=== USE THESE CREDENTIALS ===

ADMIN Login:
  Email: admin@test.com
  Password: Admin@123

USER Login:
  Email: user@test.com
  Password: User@123
```

**Use exactly these credentials in the login form**

### Step 4: Make Sure Server is Running
Ensure the server is running on http://localhost:5000
Check the terminal shows:
```
✓ Database connected
Server running on http://localhost:5000
```

### Step 5: Clear Browser Cache
- Press F12 to open Developer Tools
- Go to Storage → LocalStorage
- Delete any stored tokens/userData
- Close and reopen the login page

### Step 6: Try Login
Use the credentials from Step 3

---

## If It Still Fails:

### Check the Console Error:
1. Open the login page
2. Press F12 → Console tab
3. Open Developer Tools BEFORE clicking login
4. Try to login
5. Share the exact error message you see in the console

### Common Issues:

**Error: "Failed to connect to server"**
- Server might not be running
- Run: `npm start` in project root

**Error: "Invalid email or password"**
- Check you're using exact credentials from quick-setup.js output
- Credentials are case-sensitive

**Error: Related to api.js**
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh the page (Ctrl+F5)

---

## Quick Debug:

If the above doesn't work, run the debug script:
```
cd backend && node debug-users.js && cd ..
```

This will show you all users currently in the database and fix their passwords.

---

## Summary:

1. `cd backend && node quick-setup.js && cd ..`
2. Copy the credentials from the output
3. Use them to login on http://localhost:5000/frontend/pages/auth/login.html
4. If still failing, share the exact browser console error
