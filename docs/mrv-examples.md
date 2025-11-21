# MRV Data Examples

This document provides example MRV (Measurement, Reporting, and Verification) data for each supported methodology.

## REC-v1: Renewable Energy Credits

### Example: Solar Farm Project

```json
{
  "projectId": "PROJECT_ID_HERE",
  "dataType": "rec",
  "monitoringPeriodStart": "2024-01-01T00:00:00Z",
  "monitoringPeriodEnd": "2024-01-31T23:59:59Z",
  "data": {
    "energyGenerated": 15000,
    "emissionFactor": 0.45,
    "meterReadings": [
      {
        "date": "2024-01-07T12:00:00Z",
        "reading": 3500,
        "meterSerialNumber": "SOLAR-METER-001"
      },
      {
        "date": "2024-01-14T12:00:00Z",
        "reading": 7200,
        "meterSerialNumber": "SOLAR-METER-001"
      },
      {
        "date": "2024-01-21T12:00:00Z",
        "reading": 11000,
        "meterSerialNumber": "SOLAR-METER-001"
      },
      {
        "date": "2024-01-31T12:00:00Z",
        "reading": 15000,
        "meterSerialNumber": "SOLAR-METER-001"
      }
    ],
    "calculatedEmissionsReduced": 6750,
    "evidenceDocuments": [
      "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
      "QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB"
    ]
  }
}
```

### cURL Command

```bash
curl -X POST http://localhost:5000/api/mrv/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "projectId": "PROJECT_ID_HERE",
    "dataType": "rec",
    "monitoringPeriodStart": "2024-01-01T00:00:00Z",
    "monitoringPeriodEnd": "2024-01-31T23:59:59Z",
    "data": {
      "energyGenerated": 15000,
      "emissionFactor": 0.45,
      "meterReadings": [
        {
          "date": "2024-01-31T12:00:00Z",
          "reading": 15000,
          "meterSerialNumber": "SOLAR-METER-001"
        }
      ],
      "calculatedEmissionsReduced": 6750
    }
  }'
```

### Expected Response

```json
{
  "success": true,
  "message": "MRV data submitted successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "projectId": "PROJECT_ID_HERE",
    "dataType": "rec",
    "validationStatus": "validated",
    "calculatedCredits": 6750,
    "guardianSubmissionStatus": "pending",
    "createdAt": "2024-01-31T10:30:00Z"
  }
}
```

---

## REDD+: Reforestation

### Example: Forest Restoration Project

```json
{
  "projectId": "PROJECT_ID_HERE",
  "dataType": "redd",
  "monitoringPeriodStart": "2024-01-01T00:00:00Z",
  "monitoringPeriodEnd": "2024-12-31T23:59:59Z",
  "data": {
    "vintageYear": 2024,
    "fieldMeasurements": {
      "treesPlanted": 50000,
      "treesSurvived": 47500,
      "survivalRate": 95,
      "averageHeight": 2.5,
      "averageDiameter": 8.5,
      "samplePlots": [
        {
          "plotId": "PLOT-001",
          "treesCount": 250,
          "biomass": 125.5
        },
        {
          "plotId": "PLOT-002",
          "treesCount": 245,
          "biomass": 122.3
        },
        {
          "plotId": "PLOT-003",
          "treesCount": 248,
          "biomass": 124.1
        }
      ]
    },
    "satelliteData": {
      "imageDate": "2024-12-15T00:00:00Z",
      "ndviValue": 0.72,
      "canopyCover": 68,
      "imageHash": "QmSatelliteImageHash123456789"
    },
    "carbonSequestration": {
      "biomassCarbonStock": 2850,
      "soilCarbonStock": 650,
      "totalSequestered": 3500,
      "calculationMethod": "IPCC Tier 2"
    },
    "evidencePhotos": [
      "QmPhotoHash1",
      "QmPhotoHash2",
      "QmPhotoHash3"
    ]
  }
}
```

### cURL Command

```bash
curl -X POST http://localhost:5000/api/mrv/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "projectId": "PROJECT_ID_HERE",
    "dataType": "redd",
    "monitoringPeriodStart": "2024-01-01T00:00:00Z",
    "monitoringPeriodEnd": "2024-12-31T23:59:59Z",
    "data": {
      "vintageYear": 2024,
      "fieldMeasurements": {
        "treesPlanted": 50000,
        "treesSurvived": 47500
      },
      "carbonSequestration": {
        "biomassCarbonStock": 2850,
        "soilCarbonStock": 650,
        "totalSequestered": 3500,
        "calculationMethod": "IPCC Tier 2"
      }
    }
  }'
```

### Expected Response

```json
{
  "success": true,
  "message": "MRV data submitted successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "projectId": "PROJECT_ID_HERE",
    "dataType": "redd",
    "validationStatus": "validated",
    "calculatedCredits": 3500,
    "guardianSubmissionStatus": "pending",
    "createdAt": "2024-12-31T15:45:00Z"
  }
}
```

---

## OPR-v1: Ocean Plastic Removal

### Example: Coastal Cleanup Project

```json
{
  "projectId": "PROJECT_ID_HERE",
  "dataType": "opr",
  "monitoringPeriodStart": "2024-01-01T00:00:00Z",
  "monitoringPeriodEnd": "2024-01-31T23:59:59Z",
  "data": {
    "collectionEvents": [
      {
        "eventDate": "2024-01-05T08:00:00Z",
        "location": "Bali Beach, Indonesia",
        "plasticType": "Mixed",
        "weightCollected": 450,
        "volumeCollected": 12.5,
        "numberOfParticipants": 25
      },
      {
        "eventDate": "2024-01-12T08:00:00Z",
        "location": "Bali Beach, Indonesia",
        "plasticType": "PET",
        "weightCollected": 320,
        "volumeCollected": 9.2,
        "numberOfParticipants": 18
      },
      {
        "eventDate": "2024-01-19T08:00:00Z",
        "location": "Bali Beach, Indonesia",
        "plasticType": "HDPE",
        "weightCollected": 280,
        "volumeCollected": 8.1,
        "numberOfParticipants": 22
      },
      {
        "eventDate": "2024-01-26T08:00:00Z",
        "location": "Bali Beach, Indonesia",
        "plasticType": "Mixed",
        "weightCollected": 350,
        "volumeCollected": 10.5,
        "numberOfParticipants": 20
      }
    ],
    "totalPlasticCollected": 1.4,
    "plasticBreakdown": {
      "PET": 0.32,
      "HDPE": 0.28,
      "PVC": 0.05,
      "LDPE": 0.15,
      "PP": 0.12,
      "PS": 0.08,
      "Mixed": 0.4
    },
    "weighingRecords": [
      {
        "recordId": "WR-001",
        "date": "2024-01-05T14:00:00Z",
        "weight": 450,
        "scaleSerialNumber": "SCALE-001",
        "witnessName": "John Doe"
      },
      {
        "recordId": "WR-002",
        "date": "2024-01-12T14:00:00Z",
        "weight": 320,
        "scaleSerialNumber": "SCALE-001",
        "witnessName": "Jane Smith"
      },
      {
        "recordId": "WR-003",
        "date": "2024-01-19T14:00:00Z",
        "weight": 280,
        "scaleSerialNumber": "SCALE-001",
        "witnessName": "John Doe"
      },
      {
        "recordId": "WR-004",
        "date": "2024-01-26T14:00:00Z",
        "weight": 350,
        "scaleSerialNumber": "SCALE-001",
        "witnessName": "Jane Smith"
      }
    ],
    "calculatedEmissionsAverted": 3.5,
    "evidencePhotos": [
      "QmPlasticPhoto1",
      "QmPlasticPhoto2",
      "QmPlasticPhoto3",
      "QmPlasticPhoto4"
    ],
    "gpsTrackingData": "QmGPSTrackingHash"
  }
}
```

### cURL Command

```bash
curl -X POST http://localhost:5000/api/mrv/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "projectId": "PROJECT_ID_HERE",
    "dataType": "opr",
    "monitoringPeriodStart": "2024-01-01T00:00:00Z",
    "monitoringPeriodEnd": "2024-01-31T23:59:59Z",
    "data": {
      "totalPlasticCollected": 1.4,
      "collectionEvents": [
        {
          "eventDate": "2024-01-05T08:00:00Z",
          "location": "Bali Beach, Indonesia",
          "plasticType": "Mixed",
          "weightCollected": 450
        }
      ],
      "weighingRecords": [
        {
          "recordId": "WR-001",
          "date": "2024-01-05T14:00:00Z",
          "weight": 450,
          "scaleSerialNumber": "SCALE-001",
          "witnessName": "John Doe"
        }
      ],
      "evidencePhotos": ["QmPlasticPhoto1"]
    }
  }'
```

### Expected Response

```json
{
  "success": true,
  "message": "MRV data submitted successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
    "projectId": "PROJECT_ID_HERE",
    "dataType": "opr",
    "validationStatus": "validated",
    "calculatedCredits": 3.5,
    "guardianSubmissionStatus": "pending",
    "createdAt": "2024-01-31T16:20:00Z"
  }
}
```

---

## Validation Endpoint

Test your MRV data before submission:

```bash
curl -X POST http://localhost:5000/api/mrv/validate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "dataType": "rec",
    "data": {
      "energyGenerated": 15000,
      "emissionFactor": 0.45,
      "meterReadings": [
        {
          "date": "2024-01-31T12:00:00Z",
          "reading": 15000,
          "meterSerialNumber": "SOLAR-METER-001"
        }
      ]
    }
  }'
```

### Validation Response (Success)

```json
{
  "success": true,
  "data": {
    "isValid": true,
    "errors": [],
    "calculatedCredits": 6750
  }
}
```

### Validation Response (Failure)

```json
{
  "success": true,
  "data": {
    "isValid": false,
    "errors": [
      "Energy generated must be greater than 0",
      "At least one meter reading is required"
    ],
    "calculatedCredits": 0
  }
}
```

---

## Common Validation Errors

### REC (Renewable Energy)

| Error | Cause | Fix |
|-------|-------|-----|
| "Energy generated must be greater than 0" | energyGenerated ≤ 0 | Provide positive value |
| "Emission factor must be greater than 0" | emissionFactor ≤ 0 | Provide positive value |
| "At least one meter reading is required" | meterReadings array empty | Add meter readings |
| "Monitoring period start and end dates are required" | Missing dates | Provide both dates |

### REDD+ (Reforestation)

| Error | Cause | Fix |
|-------|-------|-----|
| "Trees planted must be greater than 0" | treesPlanted ≤ 0 | Provide positive value |
| "Trees survived must be greater than 0" | treesSurvived ≤ 0 | Provide positive value |
| "Total carbon sequestered must be greater than 0" | totalSequestered ≤ 0 | Provide positive value |
| "Valid vintage year is required" | Invalid year | Use current or recent year |

### OPR (Ocean Plastic Removal)

| Error | Cause | Fix |
|-------|-------|-----|
| "Total plastic collected must be greater than 0" | totalPlasticCollected ≤ 0 | Provide positive value |
| "At least one collection event is required" | collectionEvents array empty | Add collection events |
| "At least one weighing record is required" | weighingRecords array empty | Add weighing records |
| "At least one evidence photo is required" | evidencePhotos array empty | Add IPFS hashes |

---

## Tips for Successful Submission

1. **Always validate first**: Use `/api/mrv/validate` before submitting
2. **Use correct data types**: Ensure numbers are numbers, not strings
3. **Provide complete data**: Include all required fields
4. **Use IPFS for documents**: Upload documents to IPFS and include hashes
5. **Check date formats**: Use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
6. **Monitor submission status**: Check `guardianSubmissionStatus` field
7. **Keep records**: Store submission IDs for tracking

## Next Steps

After successful MRV data submission:

1. Monitor Guardian workflow status via WebSocket
2. Wait for auditor review
3. Check for approval/rejection notifications
4. Track NFT minting progress
5. Verify carbon credits in Hedera account
