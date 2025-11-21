import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, UserRole } from '../types';

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.BUYER,
      required: true,
    },
    hederaAccountId: {
      type: String,
      sparse: true,
      trim: true,
    },
    hederaPublicKey: {
      type: String,
      sparse: true,
      trim: true,
    },
    organization: {
      name: {
        type: String,
        trim: true,
      },
      type: {
        type: String,
        enum: ['individual', 'company', 'ngo', 'government'],
      },
      taxId: {
        type: String,
        trim: true,
      },
      website: {
        type: String,
        trim: true,
      },
    },
    kyc: {
      status: {
        type: String,
        enum: ['not_submitted', 'pending', 'approved', 'rejected'],
        default: 'not_submitted',
      },
      submittedAt: Date,
      verifiedAt: Date,
      documents: [
        {
          type: {
            type: String,
            enum: ['id', 'proof_of_address', 'business_registration', 'tax_document'],
          },
          url: String,
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      rejectionReason: String,
    },
    permissions: {
      type: [String],
      default: [],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshTokens: {
      type: [String],
      default: [],
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete (ret as any).password;
        delete (ret as any).refreshTokens;
        delete (ret as any).passwordResetToken;
        delete (ret as any).passwordResetExpires;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ hederaAccountId: 1 }, { sparse: true });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });

// Pre-save hook to hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Static method to find user by credentials
UserSchema.statics.findByCredentials = async function (
  email: string,
  password: string
) {
  const user = await this.findOne({ email, isActive: true }).select('+password');

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  return user;
};

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
