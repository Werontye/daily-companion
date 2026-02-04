import mongoose, { Document, Model, Schema, CallbackError } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  email: string
  password?: string
  displayName: string
  avatar?: string
  avatarType: 'initial' | 'photo'
  bio?: string
  provider?: 'credentials'
  createdAt: Date
  updatedAt: Date
  lastLogin?: Date
  isEmailVerified: boolean
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
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
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
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
