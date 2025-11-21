# ImpactMint - Quick Start

A carbon offset NFT platform on Hedera blockchain.

## 🚀 Super Quick Setup (3 Steps)

### Step 1: Install Docker Desktop
1. Download from https://www.docker.com/products/docker-desktop/
2. Install and restart computer
3. Open Docker Desktop

### Step 2: Configure
```powershell
# Open PowerShell in this folder
cd C:\Users\mamta\Desktop\impactmint

# Copy environment file
copy env.docker.example .env

# Edit .env in Notepad
notepad .env
```

Fill in these values in `.env`:
- `MONGO_ROOT_PASSWORD` - Any password you want
- `REDIS_PASSWORD` - Any password you want
- `JWT_SECRET` - Any long random text (32+ characters)
- `JWT_REFRESH_SECRET` - Another long random text
- `HEDERA_OPERATOR_ID` - Your Hedera account (from Hedera portal)
- `HEDERA_OPERATOR_KEY` - Your Hedera private key

### Step 3: Start
```powershell
docker-compose up -d
```

Wait 5-10 minutes for first-time setup.

### Access
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000/health

## 📖 Full Guide

See [DOCKER_SETUP_GUIDE.md](DOCKER_SETUP_GUIDE.md) for detailed beginner-friendly instructions.

## 🛑 Stop
```powershell
docker-compose down
```

## 📊 Check Status
```powershell
docker-compose ps
```

## 📝 View Logs
```powershell
docker-compose logs -f
```

## ❓ Problems?

1. **Check Docker Desktop is running** (green icon in taskbar)
2. **Check logs**: `docker-compose logs backend`
3. **Restart**: `docker-compose restart`

## 🎯 What's Included

- NFT Minting System
- Marketplace (buy/sell carbon credits)
- Retirement & Certificates
- Methodology Management
- Analytics Dashboard

## 📚 Documentation

- [Docker Setup Guide](DOCKER_SETUP_GUIDE.md) - Beginner-friendly
- [API Documentation](docs/api-documentation.md)
- [User Guide](docs/user-guide.md)

---

**Built with ❤️ for a sustainable future**
