import mongoose, { Document, Model, Schema, Types } from 'mongoose'

export interface IAchievement extends Document {
  userId: Types.ObjectId
  achievementId: string
  name: string
  description: string
  icon: string
  category: 'productivity' | 'consistency' | 'milestones' | 'social'
  unlocked: boolean
  unlockedAt?: Date
  progress: number
  maxProgress: number
  createdAt: Date
  updatedAt: Date
}

const achievementSchema = new Schema<IAchievement>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    achievementId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['productivity', 'consistency', 'milestones', 'social'],
      required: true,
    },
    unlocked: {
      type: Boolean,
      default: false,
    },
    unlockedAt: {
      type: Date,
    },
    progress: {
      type: Number,
      default: 0,
    },
    maxProgress: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index for user achievements queries
achievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true })
achievementSchema.index({ userId: 1, unlocked: 1 })
achievementSchema.index({ userId: 1, category: 1 })

const Achievement: Model<IAchievement> =
  mongoose.models.Achievement || mongoose.model<IAchievement>('Achievement', achievementSchema)

export default Achievement
