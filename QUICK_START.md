# 🚀 Quick Test Run (No Docker)

## What You Need

1. **Node.js 18+** - Download from https://nodejs.org/ (get LTS version)
2. **MongoDB** - You're already using MongoDB Atlas (cloud), so you're good!
3. **Your existing `.env` file** in the backend folder

---

## Step 1: Run Backend

### Open PowerShell/Terminal
```powershell
cd C:\Users\mamta\Desktop\impactmint\backend
```

### Install Dependencies (First Time Only)
```powershell
npm install
```

This will take 2-3 minutes. You'll see lots of packages being installed.

### Start Backend Server
```powershell
npm run dev
```

**You should see:**
```
Server running on port 5000 in development mode
Connected to MongoDB
Hedera client initialized
```

**Keep this window open!** The backend is now running.

**Test it:** Open browser → http://localhost:5000/health

You should see: `{"success":true,"message":"Server is running"}`

---

## Step 2: Run Frontend (New Window)

### Open NEW PowerShell/Terminal Window
```powershell
cd C:\Users\mamta\Desktop\impactmint\frontend
```

### Install Dependencies (First Time Only)
```powershell
npm install
```

This will take 3-5 minutes.

### Start Frontend
```powershell
npm start
```

**You should see:**
```
Compiled successfully!
Local: http://localhost:3000
```

**Browser will open automatically** to http://localhost:3000

---

## ✅ You're Done!

Now you have:
- **Backend running** on http://localhost:5000
- **Frontend running** on http://localhost:3000

Both windows must stay open while you're testing.

---

## 🛑 To Stop

Press `Ctrl + C` in each PowerShell window.

---

## 📝 Common Issues

### "npm: command not found"
**Solution:** Install Node.js from https://nodejs.org/

### "Port 5000 is already in use"
**Solution:** Something else is using port 5000.

Find and kill it:
```powershell
# Find what's using port 5000
netstat -ano | findstr :5000

# You'll see a number at the end (PID), like 12345
# Kill it:
taskkill /PID 12345 /F
```

Or change the port in `backend/.env`:
```
PORT=5001
```

### "Cannot connect to MongoDB"
**Solution:** Check your `backend/.env` file has the correct MongoDB Atlas connection string:
```
MONGODB_URI=mongodb+srv://swayamanand2303:Swayam%402303@impact.zkhfuvg.mongodb.net/impact?retryWrites=true&w=majority&appName=impact
```

### Backend starts but shows errors
**Solution:** Check the error message. Common issues:
- Missing environment variables in `.env`
- Wrong Hedera credentials
- MongoDB connection string incorrect

---

## 🎯 Quick Commands

| Action | Command |
|--------|---------|
| Start backend | `cd backend` → `npm run dev` |
| Start frontend | `cd frontend` → `npm start` |
| Stop | Press `Ctrl + C` |
| Restart | Stop and run again |

---

## 📊 Testing the Platform

Once both are running:

1. **Open Frontend**: http://localhost:3000
2. **Test Backend API**: http://localhost:5000/health
3. **View Methodologies**: http://localhost:5000/api/methodologies
4. **View Marketplace**: http://localhost:5000/api/marketplace/stats

---

## 🔍 Viewing Logs

All logs appear in the PowerShell windows where you ran the commands.

**Backend logs** show:
- API requests
- Database queries
- Hedera transactions
- Errors

**Frontend logs** show:
- Compilation status
- Warnings
- Errors

---

## 💡 Pro Tips

1. **Keep both windows visible** so you can see errors immediately
2. **If you change backend code**, it auto-restarts (nodemon)
3. **If you change frontend code**, it auto-refreshes in browser
4. **Check backend logs** if frontend shows "Cannot connect to server"

---

## Next Steps

1. Open http://localhost:3000
2. Try creating an account
3. Explore the marketplace
4. Check the analytics dashboard

**When you're ready for Docker**, just follow the Docker setup guide!

---

## Summary

**Two Commands:**
```powershell
# Terminal 1 (Backend)
cd backend
npm run dev

# Terminal 2 (Frontend)  
cd frontend
npm start
```

**That's it!** No Docker needed for testing.
