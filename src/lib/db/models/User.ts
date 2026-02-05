import mongoose, { Document, Model, Schema, CallbackError } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IWarning {
  reason: string
  issuedBy: string
  issuedAt: Date
}

export interface IUser extends Document {
  username: string
  email?: string
  password?: string
  displayName: string
  avatar?: string
  avatarType: 'initial' | 'photo'
  bio?: string
  provider?: 'credentials'
  createdAt: Date
  updatedAt: Date
  lastLogin?: Date
  isCreator: boolean
  isAdmin: boolean
  isBanned: boolean
  banReason?: string
  bannedAt?: Date
  bannedBy?: string
  warnings: IWarning[]
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      minlength: 3,
      maxlength: 20,
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true, // Allow multiple null values
    },
    password: {
      type: String,
      select: false, // Don't include password by default in queries
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: function () {
        return this.displayName.charAt(0).toUpperCase()
      },
    },
    avatarType: {
      type: String,
      enum: ['initial', 'photo'],
      default: 'initial',
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    provider: {
      type: String,
      enum: ['credentials'],
      default: 'credentials',
    },
    lastLogin: {
      type: Date,
    },
    isCreator: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    banReason: {
      type: String,
    },
    bannedAt: {
      type: Date,
    },
    bannedBy: {
      type: String,
    },
    warnings: [{
      reason: { type: String, required: true },
      issuedBy: { type: String, required: true },
      issuedAt: { type: Date, default: Date.now },
    }],
  },
  {
    timestamps: true,
  }
)


// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return
  }

  // Only hash if password exists (OAuth users won't have passwords)
  if (this.password) {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
  }
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    if (!this.password) {
      return false
    }
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    return false
  }
}

// Prevent model overwrite
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema)

export default User
