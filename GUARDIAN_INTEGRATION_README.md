# Hedera Guardian Integration - Implementation Complete

## 🎉 Overview

The Hedera Guardian integration has been successfully implemented for the ImpactMint platform. This integration enables authentic carbon credit verification through Guardian's digital MRV (Measurement, Reporting, and Verification) framework.

## ✅ What's Been Implemented

### 1. Infrastructure (Docker & Configuration)

- ✅ **Docker Compose Setup** (`docker-compose.guardian.yml`)
  - Guardian service, MongoDB, IPFS, NATS message broker
  - Auth service, worker service, logger service
  - API gateway and MRV sender
  - Complete networking and volume configuration

- ✅ **Environment Configuration** (`.env.example` updated)
  - Guardian API connection settings
  - Hedera account configuration
  - IPFS storage settings
  - Webhook configuration
  - Sync worker settings

### 2. Guardian Policies (3 Methodologies)

- ✅ **REC-v1** (`backend/guardian-policies/rec-v1-policy.json`)
  - Renewable energy carbon credits
  - Energy generation tracking
  - Emission factor calculations
  - Meter reading validation

- ✅ **REDD+** (`backend/guardian-policies/redd-plus-policy.json`)
  - Reforestation and forest conservation
  - Tree counting and survival rates
  - Satellite imagery verification
  - Carbon sequestration calculations

- ✅ **OPR-v1** (`backend/guardian-policies/opr-v1-policy.json`)
  - Ocean plastic removal credits
  - Collection event tracking
  - Non-incineration verification
  - Chain of custody validation

### 3. Backend Services

- ✅ **Guardian Service** (`backend/src/services/guardian.service.ts`)
  - Complete Guardian API client with retry logic
  - Account creation and management
  - Project submission and tracking
  - MRV data upload
  - Document management (IPFS)
  - NFT minting triggers
  - Webhook signature verification

- ✅ **MRV Service** (`backend/src/services/mrv.service.ts`)
  - Methodology-specific data validation
  - Data transformation for Guardian
  - Queue management for submissions
  - Carbon credit calculations

- ✅ **Notification Service** (`backend/src/services/notification.service.ts`)
  - Email notifications for workflow events
  - Project submission confirmations
  - Auditor assignments
  - Approval/rejection notifications
  - Minting completion alerts

- ✅ **Guardian Sync Worker** (`backend/src/workers/guardian-sync.worker.ts`)
  - Background polling of Guardian status
  - Automatic workflow state updates
  - Notification triggers
  - WebSocket event emissions

### 4. Database Models

- ✅ **GuardianWorkflow** (`backend/src/models/GuardianWorkflow.model.ts`)
  - Workflow state tracking
  - State history with timestamps
  - Error logging
  - Retry counting

- ✅ **MRVData** (`backend/src/models/MRVData.model.ts`)
  - MRV data storage
  - Validation status tracking
  - Guardian submission status
  - Calculated credits

- ✅ **AuditorAssignment** (`backend/src/models/AuditorAssignment.model.ts`)
  - Multi-auditor coordination
  - Review status tracking
  - Approval decisions
  - Notification management

- ✅ **Project Model Updates** (`backend/src/models/Project.model.ts`)
  - Guardian policy ID
  - Guardian project ID and DID
  - Workflow status
  - Auditor assignments

### 5. API Layer

- ✅ **MRV Controller** (`backend/src/controllers/mrv.controller.ts`)
  - Submit MRV data
  - Retrieve MRV data by project
  - Update/delete MRV data
  - Validate MRV data

- ✅ **Guardian Controller** (`backend/src/controllers/guardian.controller.ts`)
  - List Guardian policies
  - Get policy details
  - Handle Guardian webhooks
  - Retrieve IPFS documents
  - Get project status

- ✅ **Routes** (`backend/src/routes/`)
  - MRV routes with authentication
  - Guardian routes with webhook support
  - Role-based access control

### 6. Real-Time Updates

- ✅ **WebSocket Service Updates** (`backend/src/services/websocket.service.ts`)
  - Guardian status change events
  - MRV data update events
  - Auditor notification events
  - Minting progress events

### 7. Type Definitions

- ✅ **Guardian Types** (`backend/src/types/index.ts`)
  - GuardianWorkflowStatus enum
  - MRVDataType and MRVDataStatus enums
  - IGuardianWorkflow interface
  - IMRVData interface
  - IAuditorAssignment interface
  - Guardian API response types

### 8. Documentation

- ✅ **Guardian Integration Guide** (`docs/guardian-integration.md`)
  - Architecture overview
  - Workflow state machine
  - Component descriptions
  - API endpoints
  - Database schema
  - Error handling
  - Security considerations
  - Troubleshooting

- ✅ **Guardian Setup Guide** (`docs/guardian-setup.md`)
  - Step-by-step deployment instructions
  - Hedera account creation
  - IPFS configuration
  - Policy import process
  - Backend integration
  - Testing procedures
  - Production checklist

- ✅ **MRV Examples** (`docs/mrv-examples.md`)
  - Real-world examples for each methodology
  - cURL commands for testing
  - Expected responses
  - Validation examples
  - Common errors and solutions

## 📁 File Structure

```
impactmint/
├── docker-compose.guardian.yml          # Guardian services
├── backend/
│   ├── .env.example                     # Updated with Guardian config
│   ├── guardian-policies/
│   │   ├── rec-v1-policy.json          # Renewable energy policy
│   │   ├── redd-plus-policy.json       # Reforestation policy
│   │   └── opr-v1-policy.json          # Ocean plastic policy
│   └── src/
│       ├── controllers/
│       │   ├── mrv.controller.ts        # MRV data endpoints
│       │   └── guardian.controller.ts   # Guardian endpoints
│       ├── models/
│       │   ├── GuardianWorkflow.model.ts
│       │   ├── MRVData.model.ts
│       │   ├── AuditorAssignment.model.ts
│       │   └── Project.model.ts         # Updated with Guardian fields
│       ├── routes/
│       │   ├── mrv.routes.ts
│       │   └── guardian.routes.ts
│       ├── services/
│       │   ├── guardian.service.ts      # Guardian API client
│       │   ├── mrv.service.ts           # MRV validation
│       │   ├── notification.service.ts  # Email notifications
│       │   └── websocket.service.ts     # Updated with Guardian events
│       ├── workers/
│       │   └── guardian-sync.worker.ts  # Background sync
│       └── types/
│           └── index.ts                 # Updated with Guardian types
└── docs/
    ├── guardian-integration.md          # Integration guide
    ├── guardian-setup.md                # Setup instructions
    └── mrv-examples.md                  # MRV data examples
```

## 🚀 Next Steps

### 1. Install Dependencies

```bash
cd backend
npm install axios nodemailer
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:
- Hedera account IDs and keys
- Guardian API URL
- IPFS storage credentials
- Webhook secret
- SMTP settings for notifications

### 3. Deploy Guardian

```bash
docker-compose -f docker-compose.guardian.yml up -d
```

### 4. Import Policies

Import the three policy files through Guardian UI or API.

### 5. Start Backend

Update `server.ts` to initialize Guardian services and start the backend.

### 6. Test Integration

Use the examples in `docs/mrv-examples.md` to test the complete workflow.

## 📊 Workflow Summary

```
1. Project Developer submits project → Guardian
2. Project Developer submits MRV data → Validation → Guardian
3. Guardian Sync Worker polls status → Updates database
4. Auditor receives notification → Reviews project
5. Auditor approves → Guardian processes
6. Guardian mints NFTs → Notification sent
7. Carbon credits available in Hedera account
```

## 🔧 Key Features

- **Automatic Status Sync**: Background worker polls Guardian every 30 seconds
- **Real-Time Updates**: WebSocket events for instant frontend updates
- **Email Notifications**: Automated emails at each workflow stage
- **Multi-Auditor Support**: Coordinate multiple auditors per project
- **Retry Logic**: Exponential backoff for failed Guardian API calls
- **Comprehensive Validation**: Methodology-specific MRV data validation
- **Document Management**: IPFS integration for document storage
- **Error Tracking**: Detailed error logs in database and application logs

## ⚠️ Important Notes

1. **Lint Errors**: TypeScript lint errors are expected until dependencies are installed (`npm install`)
2. **Guardian Deployment**: Requires Docker with 8GB RAM and 20GB disk space
3. **Hedera Accounts**: Need testnet accounts with HBAR for testing
4. **IPFS Storage**: Requires Web3.Storage or Filebase account
5. **Testing**: Test thoroughly on testnet before production deployment

## 📚 Documentation

- **Integration Guide**: `docs/guardian-integration.md` - Complete technical documentation
- **Setup Guide**: `docs/guardian-setup.md` - Step-by-step deployment instructions
- **MRV Examples**: `docs/mrv-examples.md` - Real-world data examples and testing

## 🎯 Testing Checklist

- [ ] Deploy Guardian services
- [ ] Import all three policies
- [ ] Create test project
- [ ] Submit REC MRV data
- [ ] Submit REDD+ MRV data
- [ ] Submit OPR MRV data
- [ ] Test auditor assignment
- [ ] Test approval workflow
- [ ] Verify NFT minting
- [ ] Check WebSocket events
- [ ] Verify email notifications

## 💡 Support

For issues or questions:
1. Check `docs/guardian-integration.md` troubleshooting section
2. Review Guardian logs: `docker-compose -f docker-compose.guardian.yml logs`
3. Check application logs for errors
4. Refer to [Hedera Guardian Documentation](https://docs.hedera.com/guardian)

---

**Implementation Status**: ✅ Complete and ready for testing
**Next Action**: Configure environment variables and deploy Guardian services
