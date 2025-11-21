import mongoose, { Schema } from 'mongoose';
import { IProject, ProjectStatus } from '../types';

const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [200, 'Project name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    owner: {
      type: String,
      ref: 'User',
      required: true,
      index: true,
    },
    location: {
      country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true,
      },
      region: {
        type: String,
        required: [true, 'Region is required'],
        trim: true,
      },
      address: {
        type: String,
        trim: true,
      },
      // GeoJSON Point for geospatial queries
      geometry: {
        type: {
          type: String,
          enum: ['Point'],
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          validate: {
            validator: function (coords: number[]) {
              return (
                coords.length === 2 &&
                coords[0] >= -180 &&
                coords[0] <= 180 &&
                coords[1] >= -90 &&
                coords[1] <= 90
              );
            },
            message: 'Invalid coordinates format. Use [longitude, latitude]',
          },
        },
      },
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1 metric ton'],
    },
    verifiedCapacity: {
      type: Number,
      min: 0,
    },
    methodology: {
      type: String,
      required: [true, 'Methodology is required'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (this: IProject, value: Date) {
          return !value || value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    status: {
      type: String,
      enum: Object.values(ProjectStatus),
      default: ProjectStatus.DRAFT,
      required: true,
      index: true,
    },
    documents: [
      {
        name: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    images: {
      type: [String],
      default: [],
    },
    // Guardian Integration Fields
    guardianPolicyId: {
      type: String,
      sparse: true,
    },
    guardianProjectId: {
      type: String,
      sparse: true,
    },
    guardianDID: {
      type: String,
      sparse: true,
    },
    guardianWorkflowStatus: {
      type: String,
      sparse: true,
    },
    assignedAuditors: {
      type: [String],
      default: [],
    },
    requiredApprovals: {
      type: Number,
      default: 1,
      min: 1,
    },
    currentApprovals: {
      type: Number,
      default: 0,
      min: 0,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Indexes
ProjectSchema.index({ owner: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ createdAt: -1 });
ProjectSchema.index({ 'location.country': 1 });
ProjectSchema.index({ methodology: 1 });
// Compound index for common queries
ProjectSchema.index({ status: 1, createdAt: -1 });
ProjectSchema.index({ owner: 1, status: 1 });
// Geospatial index for location queries
ProjectSchema.index({ 'location.geometry': '2dsphere' });
// Text index for search functionality
ProjectSchema.index({ name: 'text', description: 'text' });

// Virtual for project progress
ProjectSchema.virtual('progress').get(function (this: IProject) {
  if (!this.verifiedCapacity || !this.capacity) {
    return 0;
  }
  return Math.round((this.verifiedCapacity / this.capacity) * 100);
});

const Project = mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
