# Hedera NFT Minting System - Complete Guide

## Overview

This guide covers the complete Hedera NFT minting system for carbon credits, including setup, usage, and troubleshooting.

## Architecture

```
Guardian Approval → Automated Minting Worker → Certificate Generation
                                              ↓
                                         IPFS Upload
                                              ↓
                                      Hedera Token Service
                                              ↓
                                         NFT Minted
                                              ↓
                                    Database + Notifications
```

## Components

### 1. Hedera Token Service (`hedera-token.service.ts`)

**NFT Collection Creation**:
```typescript
const result = await HederaTokenService.createNFTCollection({
  name: 'ImpactMint Carbon Credits - REC',
  symbol: 'IMREC',
  treasuryAccountId: '0.0.12345',
  supplyKey: privateKey,
  royaltyFee: 5, // 5% royalty on secondary sales
  fallbackFee: 0.1 // 0.1 HBAR fallback fee
});
```

**Single NFT Minting**:
```typescript
const result = await HederaTokenService.mintNFT({
  tokenId: '0.0.67890',
  supplyKey: privateKey,
  metadata: IPFSService.hashToBytes(ipfsHash)
});
```

**Batch Minting** (100+ NFTs):
```typescript
const results = await HederaTokenService.batchMintNFTs({
  tokenId: '0.0.67890',
  supplyKey: privateKey,
  metadataArray: [buffer1, buffer2, ...],
  batchSize: 10,
  delayBetweenBatches: 1000
});
```

### 2. IPFS Service (`ipfs.service.ts`)

**Metadata Upload**:
```typescript
const metadata = IPFSService.generateMetadata({
  projectId: 'solar-alpha-001',
  projectName: 'Solar Farm Alpha',
  methodology: 'REC-v1',
  tonsCO2: 1,
  vintage: 2024,
  location: 'California, USA',
  verificationDate: new Date(),
  verifier: 'Guardian Auditor Pool',
  certificateImageHash: 'QmXXX...'
});

const upload = await IPFSService.uploadMetadata(metadata);
// Returns: { ipfsHash: 'QmYYY...', url: 'https://...' }
```

**Certificate Upload**:
```typescript
const upload = await IPFSService.uploadImage(
  certificateBuffer,
  'certificate-12345.png'
);
```

### 3. Certificate Generator (`certificate-generator.service.ts`)

**Generate Certificate**:
```typescript
const certificateBuffer = await CertificateGeneratorService.generateCertificate({
  projectName: 'Solar Farm Alpha',
  methodology: 'REC-v1',
  tonsCO2: 1,
  vintage: 2024,
  location: 'California, USA',
  verificationDate: new Date(),
  serialNumber: 1,
  tokenId: '0.0.67890',
  transactionId: '0.0.12345@1234567890.123456789'
});
```

Features:
- Professional design with gradients
- QR code linking to HashScan
- Project details and verification info
- Watermark for authenticity

### 4. Automated Minting Worker (`nft-minting.worker.ts`)

Automatically mints NFTs when Guardian approves projects:

1. Monitors `GuardianWorkflow` for `AUDITOR_APPROVED` status
2. Generates certificate image
3. Uploads to IPFS
4. Creates metadata
5. Mints NFT on Hedera
6. Saves to database
7. Sends notifications
8. Emits WebSocket events

**Start Worker**:
```typescript
import NFTMintingWorker from './workers/nft-minting.worker';
NFTMintingWorker.start();
```

### 5. Treasury Monitor (`treasury-monitor.worker.ts`)

Monitors treasury account balances:

- Checks balance every hour
- Alerts when balance < threshold (default 10 HBAR)
- Tracks total NFTs minted
- Provides statistics

**Start Worker**:
```typescript
import TreasuryMonitorWorker from './workers/treasury-monitor.worker';
TreasuryMonitorWorker.start();
```

## API Endpoints

### Create NFT Collection

```bash
POST /api/nft/collections
Authorization: Bearer <admin_token>

{
  "name": "ImpactMint Carbon Credits - REC",
  "symbol": "IMREC",
  "methodology": "REC",
  "royaltyFee": 5,
  "fallbackFee": 0.1
}
```

### Mint NFT

```bash
POST /api/nft/mint
Authorization: Bearer <token>

{
  "projectId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "tonsCO2": 1
}
```

### Transfer NFT

```bash
POST /api/nft/transfer
Authorization: Bearer <admin_token>

{
  "nftId": "65a1b2c3d4e5f6g7h8i9j0k2",
  "toAccountId": "0.0.98765",
  "reason": "sale",
  "price": 50
}
```

### Retire NFT

```bash
POST /api/nft/retire
Authorization: Bearer <token>

{
  "nftId": "65a1b2c3d4e5f6g7h8i9j0k2",
  "retiredBy": "Company XYZ"
}
```

### Get NFT Details

```bash
GET /api/nft/0.0.67890/1
Authorization: Bearer <token>
```

### Get Project NFTs

```bash
GET /api/nft/project/65a1b2c3d4e5f6g7h8i9j0k1
Authorization: Bearer <token>
```

### Get Analytics

```bash
GET /api/nft/analytics
Authorization: Bearer <token>
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install @hashgraph/sdk canvas qrcode form-data
```

### 2. Configure Environment

```bash
# Treasury Account
NFT_TREASURY_ACCOUNT_ID=0.0.YOUR_TREASURY_ID
NFT_TREASURY_PRIVATE_KEY=YOUR_PRIVATE_KEY
NFT_SUPPLY_KEY=YOUR_SUPPLY_KEY

# IPFS (Pinata)
IPFS_PROVIDER=pinata
IPFS_API_KEY=your-pinata-api-key
IPFS_API_SECRET=your-pinata-api-secret
IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs/
```

### 3. Create Treasury Account

```typescript
import { PrivateKey } from '@hashgraph/sdk';
import TreasuryAccount from './models/TreasuryAccount.model';

const privateKey = PrivateKey.generateED25519();
const accountId = '0.0.YOUR_ACCOUNT_ID'; // From Hedera Portal

await TreasuryAccount.create({
  accountId,
  privateKey: privateKey.toString(),
  methodology: 'REC',
  balance: 50,
  alertThreshold: 10,
  autoRefill: false
});
```

### 4. Create NFT Collection

```bash
curl -X POST http://localhost:5000/api/nft/collections \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "ImpactMint Carbon Credits - REC",
    "symbol": "IMREC",
    "methodology": "REC",
    "royaltyFee": 5,
    "fallbackFee": 0.1
  }'
```

### 5. Update Environment with Token ID

```bash
NFT_COLLECTION_REC=0.0.TOKEN_ID_FROM_RESPONSE
```

### 6. Start Workers

In `server.ts`:
```typescript
import NFTMintingWorker from './workers/nft-minting.worker';
import TreasuryMonitorWorker from './workers/treasury-monitor.worker';
import IPFSService from './services/ipfs.service';

// Initialize services
IPFSService.initialize();

// Start workers
NFTMintingWorker.start();
TreasuryMonitorWorker.start();
```

## Cost Estimates

**Hedera Testnet** (for testing):
- Collection Creation: ~$20 USD (one-time)
- Single NFT Mint: ~$0.05 USD
- Batch Mint (100 NFTs): ~$3 USD
- Transfer: ~$0.001 USD
- Burn: ~$0.001 USD

**Monthly Costs** (1000 credits/month):
- Minting: ~$30 USD
- Transfers: ~$5 USD
- **Total: ~$35 USD/month**

**IPFS Costs**:
- Pinata Free Tier: 1GB storage, sufficient for ~10,000 NFTs
- Paid: $20/month for 100GB

## Metadata Structure

```json
{
  "name": "Carbon Credit #solar-alpha-001",
  "description": "1 metric ton CO2 offset from Solar Farm Alpha",
  "image": "ipfs://QmXXX.../certificate.png",
  "attributes": [
    {"trait_type": "Methodology", "value": "REC-v1"},
    {"trait_type": "Tons CO2", "value": 1},
    {"trait_type": "Vintage", "value": 2024},
    {"trait_type": "Project", "value": "Solar Farm Alpha"},
    {"trait_type": "Location", "value": "California, USA"},
    {"trait_type": "Verification Date", "value": "2024-06-20"},
    {"trait_type": "Verifier", "value": "Guardian Auditor Pool"}
  ],
  "properties": {
    "projectId": "solar-alpha-001",
    "guardianPolicyId": "policy-123",
    "hederaTxId": "0.0.12345@1234567890.123456789"
  }
}
```

## Troubleshooting

### NFT Minting Fails

**Error**: `Insufficient balance`
- **Solution**: Fund treasury account with more HBAR

**Error**: `Invalid supply key`
- **Solution**: Verify `NFT_SUPPLY_KEY` matches collection's supply key

**Error**: `IPFS upload failed`
- **Solution**: Check IPFS API credentials, verify network connectivity

### Certificate Generation Fails

**Error**: `Canvas module not found`
- **Solution**: Install canvas: `npm install canvas`

**Error**: `Font not found`
- **Solution**: Ensure system fonts are available or use custom fonts

### Worker Not Running

**Error**: NFTs not auto-minting
- **Solution**: Check worker is started in `server.ts`
- **Solution**: Verify `NFT_AUTO_MINT_ENABLED=true`
- **Solution**: Check logs for errors

## Mirror Node Integration

Query NFT ownership:
```typescript
import HederaMirrorUtil from './utils/hedera-mirror.util';

const nftInfo = await HederaMirrorUtil.getNFTInfo('0.0.67890', 1);
const isOwner = await HederaMirrorUtil.verifyOwnership('0.0.67890', 1, '0.0.12345');
const transfers = await HederaMirrorUtil.getNFTTransferHistory('0.0.67890', 1);
```

## Best Practices

1. **Test on Testnet First**: Always test complete workflow on testnet
2. **Monitor Treasury Balance**: Set up alerts for low balance
3. **Backup IPFS Hashes**: Store all IPFS hashes in database
4. **Pin Important Content**: Pin certificates and metadata permanently
5. **Use Batch Minting**: For 10+ NFTs, use batch minting for efficiency
6. **Verify Transactions**: Always verify on HashScan after minting
7. **Secure Private Keys**: Encrypt treasury private keys in database
8. **Rate Limiting**: Respect Hedera rate limits (batch with delays)

## Security Considerations

- **Private Key Storage**: Encrypt treasury private keys
- **Access Control**: Restrict minting to authorized users
- **Transaction Verification**: Verify all transactions on Mirror Node
- **IPFS Pinning**: Ensure critical content is pinned
- **Audit Trail**: Log all minting operations
- **Multi-Signature**: Consider multi-sig for large operations

## Next Steps

1. Test NFT collection creation on testnet
2. Mint test NFT and verify on HashScan
3. Test transfer and retirement workflows
4. Monitor treasury balance
5. Set up production treasury accounts
6. Deploy to mainnet
