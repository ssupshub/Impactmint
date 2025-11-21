# Guardian Integration Guide

## Overview

This document provides a comprehensive guide to the Hedera Guardian integration in the ImpactMint platform. Guardian is used for digital MRV (Measurement, Reporting, and Verification) of carbon credit projects.

## Architecture

```
┌─────────────────┐
│   Frontend      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│  ImpactMint API │◄────►│ Guardian Service │
│   (Backend)     │      │   (Docker)       │
└────────┬────────┘      └────────┬─────────┘
         │                        │
         ▼                        ▼
┌─────────────────┐      ┌──────────────────┐
│    MongoDB      │      │  Hedera Network  │
│   (Projects,    │      │    (Testnet)     │
│   MRV Data)     │      └──────────────────┘
└─────────────────┘
```

## Workflow State Machine

```
DRAFT → SUBMITTED → VALIDATING → PENDING_AUDITOR → AUDITOR_REVIEWING
                                                           │
                                                           ▼
                                        REJECTED ←─ AUDITOR_APPROVED
                                                           │
                                                           ▼
                                                       MINTING
                                                           │
                                                           ▼
                                                       COMPLETE
```

## Components

### 1. Guardian Service (`guardian.service.ts`)

Core API client for communicating with Guardian:

- **Account Management**: Create Guardian accounts for users
- **Policy Operations**: List and retrieve Guardian policies
- **Project Submission**: Submit projects to Guardian workflows
- **MRV Data Upload**: Upload measurement data to Guardian
- **Status Tracking**: Poll Guardian for workflow status
- **Document Management**: Upload/retrieve documents via IPFS
- **Minting**: Trigger NFT minting after approval

**Key Methods:**
```typescript
GuardianService.createGuardianAccount(role, hederaAccountId)
GuardianService.submitProject(policyId, projectData, userDID)
GuardianService.uploadMRVData(policyId, projectId, mrvData, schemaName)
GuardianService.getProjectStatus(policyId, projectId)
GuardianService.triggerMinting(policyId, projectId, amount)
```

### 2. MRV Service (`mrv.service.ts`)

Handles MRV data validation and processing:

- **Validation**: Methodology-specific data validation (REC, REDD+, OPR)
- **Transformation**: Convert data to Guardian schema format
- **Queue Management**: Manage submission queue
- **Credit Calculation**: Calculate expected carbon credits

**Validation Rules:**

**REC (Renewable Energy):**
- Energy generated > 0
- Emission factor > 0
- At least one meter reading
- Valid monitoring period

**REDD+ (Reforestation):**
- Trees planted > 0
- Trees survived > 0
- Carbon sequestration data required
- Valid vintage year

**OPR (Ocean Plastic Removal):**
- Total plastic collected > 0
- At least one collection event
- At least one weighing record
- Evidence photos required

### 3. Guardian Workflow Model

Tracks Guardian workflow state:

```typescript
{
  projectId: string,
  policyId: string,
  currentStatus: GuardianWorkflowStatus,
  guardianProjectId: string,
  guardianDID: string,
  stateHistory: [{
    status: string,
    timestamp: Date,
    message: string,
    metadata: object
  }],
  errorLogs: [{
    timestamp: Date,
    error: string,
    stackTrace: string
  }],
  retryCount: number,
  lastSyncedAt: Date
}
```

### 4. Guardian Sync Worker

Background worker that:
- Polls Guardian every 30 seconds for status updates
- Updates local workflow state
- Triggers notifications on state changes
- Emits WebSocket events for real-time updates

### 5. Notification Service

Sends email notifications for:
- Project submission confirmation
- Auditor assignment
- Approval/rejection
- NFT minting completion

### 6. WebSocket Events

Real-time updates via Socket.IO:

```javascript
// Client-side subscription
socket.emit('subscribe:project', projectId);

// Server-side events
'guardian:status_change' - Workflow status changed
'mrv:data_update' - MRV data submitted/updated
'auditor:notification' - New audit assignment
'guardian:minting_progress' - NFT minting progress
```

## API Endpoints

### MRV Data Endpoints

```
POST   /api/mrv/submit              - Submit MRV data
GET    /api/mrv/project/:projectId  - Get all MRV data for project
GET    /api/mrv/:id                 - Get specific MRV data
PUT    /api/mrv/:id                 - Update MRV data
DELETE /api/mrv/:id                 - Delete MRV data
POST   /api/mrv/validate            - Validate MRV data without submitting
```

### Guardian Endpoints

```
GET    /api/guardian/policies           - List available policies
GET    /api/guardian/policies/:id       - Get policy details
POST   /api/guardian/webhook            - Guardian webhook handler
GET    /api/guardian/documents/:hash    - Retrieve IPFS document
GET    /api/guardian/status/:projectId  - Get Guardian workflow status
```

## Database Schema

### GuardianWorkflow Collection

```javascript
{
  _id: ObjectId,
  projectId: ObjectId (ref: Project),
  policyId: String,
  policyTag: String,
  currentStatus: String (enum: GuardianWorkflowStatus),
  guardianProjectId: String,
  guardianDID: String,
  guardianVPId: String,
  guardianVCIds: [String],
  stateHistory: [Object],
  errorLogs: [Object],
  retryCount: Number,
  lastSyncedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### MRVData Collection

```javascript
{
  _id: ObjectId,
  projectId: ObjectId (ref: Project),
  dataType: String (enum: 'rec', 'redd', 'opr'),
  monitoringPeriodStart: Date,
  monitoringPeriodEnd: Date,
  data: Object,
  validationStatus: String (enum: MRVDataStatus),
  validationErrors: [String],
  guardianSubmissionStatus: String,
  guardianVCId: String,
  ipfsHash: String,
  calculatedCredits: Number,
  submittedBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### AuditorAssignment Collection

```javascript
{
  _id: ObjectId,
  projectId: ObjectId (ref: Project),
  auditorId: ObjectId (ref: User),
  assignedAt: Date,
  assignedBy: ObjectId (ref: User),
  status: String (enum: 'pending', 'in_progress', 'completed', 'declined'),
  reviewNotes: String,
  approvalDecision: String (enum: 'approved', 'rejected', 'conditional'),
  approvalSignature: String,
  completedAt: Date,
  notificationSent: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

### Retry Logic

Guardian service implements exponential backoff retry:
- Max retries: 3
- Initial delay: 5 seconds
- Retryable errors: 429, 502, 503, 504, network errors

### Error Logging

All Guardian errors are logged to:
1. Application logs (Winston)
2. GuardianWorkflow.errorLogs array
3. Sentry (if configured)

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Guardian account creation failed` | Invalid Hedera account | Verify HEDERA_OPERATOR_ID and KEY |
| `Policy not found` | Invalid policy ID | Check available policies with GET /api/guardian/policies |
| `MRV data validation failed` | Invalid data format | Review validation errors in response |
| `Project submission failed` | Guardian API error | Check Guardian service logs |
| `Webhook signature invalid` | Wrong webhook secret | Verify GUARDIAN_WEBHOOK_SECRET |

## Security

### Webhook Verification

All Guardian webhooks are verified using HMAC-SHA256:

```typescript
const signature = req.headers['x-guardian-signature'];
const isValid = GuardianService.verifyWebhookSignature(payload, signature);
```

### Authentication

- All API endpoints require JWT authentication
- Role-based access control (RBAC) for sensitive operations
- Guardian API uses separate authentication token

## Performance Considerations

### Polling Optimization

- Sync worker runs every 30 seconds (configurable)
- Only active workflows are polled (not COMPLETE or FAILED)
- Batch limit: 50 workflows per sync cycle

### Database Indexes

Optimized indexes for common queries:
```javascript
GuardianWorkflow: { projectId: 1, currentStatus: 1 }
MRVData: { projectId: 1, validationStatus: 1 }
AuditorAssignment: { auditorId: 1, status: 1 }
```

## Monitoring

### Health Checks

Monitor these metrics:
- Guardian sync worker status
- Failed workflow count
- Average workflow duration
- MRV submission queue length

### Logs

Key log events:
- `Guardian service initialized`
- `Guardian account created`
- `Project submitted to Guardian`
- `MRV data uploaded to Guardian`
- `Guardian workflow status changed`
- `NFT minting triggered`

## Troubleshooting

### Guardian Service Not Responding

1. Check Guardian Docker containers: `docker-compose -f docker-compose.guardian.yml ps`
2. Check Guardian logs: `docker-compose -f docker-compose.guardian.yml logs guardian-service`
3. Verify network connectivity
4. Check GUARDIAN_API_URL environment variable

### Workflow Stuck in VALIDATING

1. Check Guardian workflow logs in database
2. Verify MRV data format matches policy schema
3. Check Guardian policy configuration
4. Review Guardian service logs for errors

### Webhooks Not Received

1. Verify GUARDIAN_WEBHOOK_SECRET is correct
2. Check webhook endpoint is accessible
3. Review Guardian webhook configuration
4. Check firewall/network settings

### MRV Data Validation Failing

1. Review validation errors in API response
2. Check methodology-specific requirements
3. Verify data types and formats
4. Test with /api/mrv/validate endpoint first

## Best Practices

1. **Always validate MRV data** before submission using `/api/mrv/validate`
2. **Monitor workflow status** via WebSocket for real-time updates
3. **Implement retry logic** in frontend for failed submissions
4. **Store Guardian IDs** (projectId, DID, VCIds) for audit trail
5. **Use IPFS hashes** for document verification
6. **Test with Guardian testnet** before production deployment
7. **Set up monitoring** for sync worker and webhook delivery
8. **Implement proper error handling** for all Guardian API calls
