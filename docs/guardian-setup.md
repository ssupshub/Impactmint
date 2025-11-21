# Guardian Setup Guide

## Prerequisites

Before setting up Guardian, ensure you have:

- **Docker & Docker Compose**: Version 20.10+ and Compose V2
- **Hedera Testnet Account**: With at least 100 HBAR
- **IPFS Storage**: Web3.Storage or Filebase account
- **System Requirements**: 8GB RAM, 20GB disk space

## Step 1: Clone and Configure

### 1.1 Navigate to Project Directory

```bash
cd c:\Users\mamta\Desktop\impactmint
```

### 1.2 Create Environment File

Copy the example environment file:

```bash
cd backend
copy .env.example .env
```

### 1.3 Configure Environment Variables

Edit `.env` and set the following Guardian-specific variables:

```bash
# Guardian Configuration
GUARDIAN_API_URL=http://localhost:3002
GUARDIAN_OPERATOR_ID=0.0.YOUR_OPERATOR_ID
GUARDIAN_OPERATOR_KEY=YOUR_OPERATOR_PRIVATE_KEY
GUARDIAN_STANDARD_REGISTRY_DID=
GUARDIAN_STANDARD_REGISTRY_KEY=YOUR_REGISTRY_PRIVATE_KEY
GUARDIAN_ACCESS_TOKEN_SECRET=your-random-secret-string
GUARDIAN_REFRESH_TOKEN_SECRET=your-random-refresh-secret
GUARDIAN_INITIALIZATION_TOPIC_ID=

# Guardian IPFS Configuration
GUARDIAN_IPFS_STORAGE_API_KEY=your-web3-storage-token
GUARDIAN_IPFS_NODE_URL=http://localhost:5001

# Guardian Webhook Configuration
GUARDIAN_WEBHOOK_SECRET=your-webhook-secret
GUARDIAN_WEBHOOK_ENABLED=true

# Guardian Sync Worker Configuration
GUARDIAN_SYNC_INTERVAL=30000
GUARDIAN_RETRY_MAX_ATTEMPTS=3
GUARDIAN_RETRY_DELAY=5000
```

## Step 2: Create Hedera Accounts

### 2.1 Create Operator Account

1. Go to [Hedera Portal](https://portal.hedera.com/)
2. Sign up and create a testnet account
3. Note your Account ID (e.g., `0.0.12345`)
4. Download your private key (DER format)
5. Convert to hex format if needed

### 2.2 Create Standard Registry Account

This is the main Guardian account:

```bash
# Using Hedera SDK (Node.js)
node -e "
const { PrivateKey } = require('@hashgraph/sdk');
const key = PrivateKey.generateED25519();
console.log('Private Key:', key.toString());
console.log('Public Key:', key.publicKey.toString());
"
```

Save the private key to `GUARDIAN_STANDARD_REGISTRY_KEY`.

### 2.3 Fund Accounts

Transfer HBAR to both accounts:
- Operator Account: 50 HBAR minimum
- Standard Registry: 100 HBAR minimum

Use [Hedera Faucet](https://portal.hedera.com/faucet) for testnet HBAR.

## Step 3: Set Up IPFS Storage

### Option A: Web3.Storage

1. Go to [web3.storage](https://web3.storage/)
2. Sign up for a free account
3. Create an API token
4. Set `GUARDIAN_IPFS_STORAGE_API_KEY` to your token

### Option B: Filebase

1. Go to [filebase.com](https://filebase.com/)
2. Create an account
3. Generate API credentials
4. Configure in `.env`

## Step 4: Deploy Guardian Services

### 4.1 Start Guardian Stack

```bash
# From project root
docker-compose -f docker-compose.guardian.yml up -d
```

### 4.2 Verify Services

Check all services are running:

```bash
docker-compose -f docker-compose.guardian.yml ps
```

Expected output:
```
NAME                        STATUS
guardian-service            Up
guardian-mongodb            Up
guardian-ipfs               Up
guardian-message-broker     Up
guardian-auth-service       Up
guardian-worker-service     Up
guardian-logger-service     Up
guardian-api-gateway        Up
guardian-mrv-sender         Up
```

### 4.3 Check Logs

```bash
# Guardian service logs
docker-compose -f docker-compose.guardian.yml logs -f guardian-service

# All services
docker-compose -f docker-compose.guardian.yml logs -f
```

## Step 5: Initialize Guardian

### 5.1 Access Guardian UI

Open browser to: http://localhost:3000

### 5.2 Create Standard Registry Account

1. Click "Register"
2. Select "Standard Registry" role
3. Enter Hedera Account ID: `GUARDIAN_OPERATOR_ID`
4. Enter Private Key: `GUARDIAN_OPERATOR_KEY`
5. Complete registration

### 5.3 Note the DID

After registration, copy the DID (Decentralized Identifier) and set:
```bash
GUARDIAN_STANDARD_REGISTRY_DID=did:hedera:testnet:...
```

## Step 6: Import Guardian Policies

### 6.1 Via Guardian UI

1. Log in as Standard Registry
2. Navigate to "Policies"
3. Click "Import Policy"
4. Upload policy files from `backend/guardian-policies/`:
   - `rec-v1-policy.json`
   - `redd-plus-policy.json`
   - `opr-v1-policy.json`

### 6.2 Via API (Alternative)

```bash
# Import REC-v1 policy
curl -X POST http://localhost:3002/api/v1/policies/import \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d @backend/guardian-policies/rec-v1-policy.json
```

### 6.3 Publish Policies

For each imported policy:
1. Select the policy
2. Click "Publish"
3. Wait for Hedera transaction confirmation
4. Note the Policy ID

## Step 7: Configure Backend Integration

### 7.1 Install Dependencies

```bash
cd backend
npm install axios nodemailer
```

### 7.2 Update Server Configuration

Edit `backend/src/server.ts` to initialize Guardian services:

```typescript
import GuardianService from './services/guardian.service';
import GuardianSyncWorker from './workers/guardian-sync.worker';
import NotificationService from './services/notification.service';

// Initialize Guardian
GuardianService.initialize();
NotificationService.initialize();

// Start Guardian sync worker
GuardianSyncWorker.start();
```

### 7.3 Register Routes

Add Guardian routes to `backend/src/server.ts`:

```typescript
import guardianRoutes from './routes/guardian.routes';
import mrvRoutes from './routes/mrv.routes';

app.use('/api/guardian', guardianRoutes);
app.use('/api/mrv', mrvRoutes);
```

## Step 8: Start Backend Services

### 8.1 Start MongoDB and Redis

```bash
docker-compose up -d mongodb redis
```

### 8.2 Start Backend

```bash
cd backend
npm run dev
```

### 8.3 Verify Integration

Check logs for:
```
Guardian service initialized
Notification service initialized
Guardian sync worker started
```

## Step 9: Test Integration

### 9.1 Get Available Policies

```bash
curl http://localhost:5000/api/guardian/policies \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 9.2 Submit Test MRV Data

```bash
curl -X POST http://localhost:5000/api/mrv/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "projectId": "PROJECT_ID",
    "dataType": "rec",
    "monitoringPeriodStart": "2024-01-01",
    "monitoringPeriodEnd": "2024-01-31",
    "data": {
      "energyGenerated": 1000,
      "emissionFactor": 0.5,
      "meterReadings": [
        {
          "date": "2024-01-31",
          "reading": 1000,
          "meterSerialNumber": "METER-001"
        }
      ]
    }
  }'
```

### 9.3 Check Guardian Status

```bash
curl http://localhost:5000/api/guardian/status/PROJECT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Step 10: Configure Webhooks

### 10.1 Set Webhook URL in Guardian

In Guardian UI:
1. Go to Settings → Webhooks
2. Add webhook URL: `http://YOUR_BACKEND_URL/api/guardian/webhook`
3. Set secret: Same as `GUARDIAN_WEBHOOK_SECRET`

### 10.2 Test Webhook

Guardian will send events to your webhook endpoint when workflow states change.

## Troubleshooting

### Guardian Services Won't Start

**Problem**: Docker containers exit immediately

**Solution**:
1. Check Docker logs: `docker-compose -f docker-compose.guardian.yml logs`
2. Verify environment variables are set
3. Ensure ports 3000, 3002, 27018, 5001 are available
4. Check system resources (RAM, disk space)

### Cannot Connect to Guardian API

**Problem**: `ECONNREFUSED` errors

**Solution**:
1. Verify Guardian service is running: `docker ps`
2. Check `GUARDIAN_API_URL` is correct
3. Test connectivity: `curl http://localhost:3002/api/v1/accounts/session`
4. Check firewall settings

### Policy Import Fails

**Problem**: Policy validation errors

**Solution**:
1. Verify JSON syntax is valid
2. Check policy schema version matches Guardian version
3. Ensure Standard Registry account is properly configured
4. Review Guardian logs for specific errors

### Hedera Transaction Failures

**Problem**: Transactions fail with insufficient balance

**Solution**:
1. Check account balance: `curl http://localhost:3002/api/v1/accounts/balance`
2. Fund account with more HBAR
3. Verify operator key is correct
4. Check Hedera network status

### Sync Worker Not Running

**Problem**: Workflow statuses not updating

**Solution**:
1. Check backend logs for "Guardian sync worker started"
2. Verify `GUARDIAN_SYNC_INTERVAL` is set
3. Check for errors in sync worker logs
4. Restart backend service

## Production Deployment

### Security Checklist

- [ ] Change all default secrets
- [ ] Use strong passwords for MongoDB
- [ ] Enable HTTPS for all endpoints
- [ ] Set up firewall rules
- [ ] Enable Guardian authentication
- [ ] Configure rate limiting
- [ ] Set up monitoring and alerts
- [ ] Enable backup for MongoDB
- [ ] Use Hedera Mainnet accounts
- [ ] Implement proper key management

### Performance Optimization

- [ ] Increase MongoDB cache size
- [ ] Configure Redis for caching
- [ ] Set up load balancer
- [ ] Enable CDN for static assets
- [ ] Optimize Docker resource limits
- [ ] Configure log rotation
- [ ] Set up database indexes
- [ ] Enable compression

### Monitoring

Set up monitoring for:
- Guardian service health
- Workflow processing time
- Failed transaction rate
- IPFS upload success rate
- Database performance
- API response times

## Next Steps

1. Review [Guardian Integration Guide](./guardian-integration.md)
2. Test with [MRV Examples](./mrv-examples.md)
3. Set up monitoring and alerts
4. Configure backup strategy
5. Plan production deployment

## Support

- **Guardian Documentation**: https://docs.hedera.com/guardian
- **Hedera Discord**: https://hedera.com/discord
- **GitHub Issues**: https://github.com/hashgraph/guardian/issues
