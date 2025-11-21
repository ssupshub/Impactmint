# 🚀 Super Simple Docker Setup Guide for Beginners

## What is Docker?

Docker is like a "virtual box" that runs your application with everything it needs (database, code, etc.) without installing each thing separately on your computer.

Think of it like this:
- **Without Docker**: Install Node.js, MongoDB, Redis, configure each one separately
- **With Docker**: Run one command, everything works together automatically

---

## Step 1: Install Docker Desktop

### Windows:
1. Go to https://www.docker.com/products/docker-desktop/
2. Click "Download for Windows"
3. Run the installer
4. Restart your computer when asked
5. Open Docker Desktop (it will appear in your system tray)

**That's it! Docker is installed.**

---

## Step 2: Setup Your Project

### 2.1 Open PowerShell
- Press `Windows Key + X`
- Click "Windows PowerShell" or "Terminal"

### 2.2 Navigate to Your Project
```powershell
cd C:\Users\mamta\Desktop\impactmint
```

### 2.3 Create Environment File
```powershell
# Copy the example file
copy env.docker.example .env

# Open it in Notepad
notepad .env
```

### 2.4 Fill in Your Values

In Notepad, replace these values:

```bash
# Change this:
MONGO_ROOT_PASSWORD=your_secure_mongodb_password_here
# To something like:
MONGO_ROOT_PASSWORD=MySecurePassword123

# Change this:
REDIS_PASSWORD=your_secure_redis_password_here
# To something like:
REDIS_PASSWORD=AnotherPassword456

# Change this:
JWT_SECRET=your_jwt_secret_min_32_characters_long
# To something like:
JWT_SECRET=this_is_my_super_secret_key_12345678

# Change this:
JWT_REFRESH_SECRET=your_refresh_secret_min_32_characters_long
# To something like:
JWT_REFRESH_SECRET=another_super_secret_refresh_key_12345

# Change this:
HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
# To your actual Hedera account (from Hedera portal):
HEDERA_OPERATOR_ID=0.0.1234567

# Change this:
HEDERA_OPERATOR_KEY=your_hedera_private_key_here
# To your actual Hedera private key:
HEDERA_OPERATOR_KEY=302e020100300506032b657004220420...
```

**Save and close Notepad**

---

## Step 3: Start Everything with One Command

In PowerShell, run:

```powershell
docker-compose up -d
```

**What this does:**
- Downloads all needed software (MongoDB, Redis, etc.)
- Starts your backend server
- Starts your frontend app
- Connects everything together

**First time will take 5-10 minutes** (downloading images)

---

## Step 4: Check if It's Working

### See if containers are running:
```powershell
docker-compose ps
```

You should see:
```
NAME                    STATUS
impactmint-mongodb      Up
impactmint-redis        Up
impactmint-backend      Up
impactmint-frontend     Up
impactmint-nginx        Up
```

### Open in Browser:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/health

If you see a webpage, **it's working!** 🎉

---

## Common Commands (Copy & Paste)

### View Logs (See What's Happening)
```powershell
# See all logs
docker-compose logs

# See only backend logs
docker-compose logs backend

# Follow logs in real-time
docker-compose logs -f
```

### Stop Everything
```powershell
docker-compose down
```

### Start Again
```powershell
docker-compose up -d
```

### Restart One Service
```powershell
# Restart backend
docker-compose restart backend

# Restart frontend
docker-compose restart frontend
```

### Delete Everything (Fresh Start)
```powershell
# WARNING: This deletes all data!
docker-compose down -v
```

---

## Troubleshooting

### Problem: "Port is already in use"

**Solution:** Another program is using the same port.

```powershell
# Find what's using port 5000
netstat -ano | findstr :5000

# Change the port in docker-compose.yml
# Find this line:
#   ports:
#     - "5000:5000"
# Change to:
#   ports:
#     - "5001:5000"
```

### Problem: "Cannot connect to Docker daemon"

**Solution:** Docker Desktop is not running.

1. Open Docker Desktop application
2. Wait for it to say "Docker Desktop is running"
3. Try your command again

### Problem: "Container keeps restarting"

**Solution:** Check the logs to see the error.

```powershell
docker-compose logs backend
```

Look for red error messages. Common issues:
- Missing environment variable in `.env`
- Wrong MongoDB password
- Wrong Hedera credentials

### Problem: "Out of disk space"

**Solution:** Clean up old Docker images.

```powershell
# Remove unused images
docker system prune -a

# This will ask for confirmation, type 'y' and press Enter
```

---

## Understanding the Files

### `docker-compose.yml`
- This file tells Docker what to run
- It lists all services (MongoDB, Backend, Frontend, etc.)
- **You don't need to edit this**

### `.env`
- Your secret passwords and settings
- **This is the only file you need to edit**
- Never share this file (it has your passwords!)

### `deploy.sh`
- Automated script for Linux/Mac
- **Windows users: Just use `docker-compose up -d` instead**

---

## Quick Reference Card

| What You Want | Command |
|---------------|---------|
| Start everything | `docker-compose up -d` |
| Stop everything | `docker-compose down` |
| See what's running | `docker-compose ps` |
| View logs | `docker-compose logs` |
| Restart backend | `docker-compose restart backend` |
| Fresh start | `docker-compose down -v` then `docker-compose up -d` |

---

## Next Steps

Once everything is running:

1. **Open Frontend**: http://localhost:3000
2. **Test Backend**: http://localhost:5000/health
3. **Check Logs**: `docker-compose logs -f`

If you see errors, copy the error message and search for it in the troubleshooting section above.

---

## Getting Help

If something doesn't work:

1. **Check Docker Desktop is running** (green icon in system tray)
2. **Check logs**: `docker-compose logs backend`
3. **Check `.env` file** - Make sure all values are filled in
4. **Restart**: `docker-compose restart`

---

## Summary

**3 Simple Steps:**
1. Install Docker Desktop
2. Edit `.env` file with your passwords
3. Run `docker-compose up -d`

**That's it!** Your entire platform is now running in Docker containers.

---

**Need more help?** The error messages in logs usually tell you exactly what's wrong. Copy the error and read it carefully - it often says what to fix!
